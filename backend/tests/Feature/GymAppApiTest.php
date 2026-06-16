<?php

namespace Tests\Feature;

use App\Jobs\TranslateExerciseJob;
use App\Jobs\TranslateMuscleJob;
use App\Jobs\CheckExerciseGifJob;
use App\Models\Day;
use App\Models\Exercise;
use App\Models\Membership;
use App\Models\Muscle;
use App\Models\Role;
use App\Models\Routine;
use App\Models\User;
use App\Services\Exercises\ExerciseDbSyncService;
use App\Services\Exercises\ExternalExerciseApiClient;
use App\Services\Translation\LibreTranslateClient;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use RuntimeException;
use Tests\TestCase;

class GymAppApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_creates_consistent_demo_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(2, Role::query()->count());
        $this->assertSame(7, Day::query()->count());
        $this->assertSame(6, User::query()->count());
        $this->assertSame(10, Muscle::query()->count());
        $this->assertSame(8, Exercise::query()->count());
        $this->assertSame(7, Membership::query()->count());
        $this->assertSame(5, Routine::query()->count());
    }

    public function test_user_can_login_and_receive_profile_with_membership_contract(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user1@gymapp.com',
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user.email', 'user1@gymapp.com')
            ->assertJsonPath('data.user.latest_membership.plan_type', 'weekly')
            ->assertJsonPath('data.user.latest_membership.plan_label', 'Semanal')
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => ['id', 'email', 'role', 'latest_membership'],
                ],
            ]);
    }

    public function test_public_catalog_endpoints_return_muscles_and_exercises(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->createExercise();

        $this->getJson('/api/v1/muscles')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'chest');

        $this->getJson('/api/v1/exercises?search=press')
            ->assertOk()
            ->assertJsonFragment(['name_es' => 'Press de banca']);
    }

    public function test_exercise_catalog_can_filter_items_with_gif(): void
    {
        $this->seed(DatabaseSeeder::class);

        $withGif = $this->createExercise();
        $withGif->forceFill([
            'gif_url' => 'https://example.com/bench.gif',
            'gif_available' => true,
            'gif_checked_at' => now(),
        ])->save();

        Exercise::query()->create(array_merge(
            $withGif->replicate(['external_id'])->toArray(),
            [
                'external_id' => 'bench-press-no-gif',
                'name_original' => 'Bench Press No GIF',
                'name_en' => 'Bench Press No GIF',
                'name_es' => 'Press sin GIF',
                'gif_url' => null,
                'gif_available' => false,
                'gif_checked_at' => now(),
            ]
        ));

        $this->getJson('/api/v1/exercises?has_gif=1&per_page=20')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.external_id', 'bench-press');

        $this->getJson('/api/v1/exercises?has_gif=0&per_page=20')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/v1/exercises?has_gif=true&per_page=20')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/exercises?has_gif=false&per_page=20')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson("/api/v1/muscles/{$withGif->muscle_id}/exercises?has_gif=1&per_page=20")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.external_id', 'bench-press');
    }

    public function test_check_exercise_gif_job_uses_get_fallback_when_head_fails(): void
    {
        $this->seed(DatabaseSeeder::class);

        Http::fake([
            'https://example.com/ok.gif' => Http::sequence()
                ->push('', 404)
                ->push('gif-bytes', 200),
        ]);

        $available = $this->createExercise();
        $available->forceFill([
            'external_id' => 'gif-ok',
            'gif_url' => 'https://example.com/ok.gif',
            'gif_available' => null,
            'gif_checked_at' => null,
        ])->save();

        (new CheckExerciseGifJob($available->id))->handle();

        $this->assertTrue($available->refresh()->gif_available);
    }

    public function test_check_exercise_gif_job_keeps_previous_state_on_temporary_failures(): void
    {
        $this->seed(DatabaseSeeder::class);

        Http::fake(fn () => throw new RuntimeException('Temporary network failure.'));

        $exercise = $this->createExercise();
        $exercise->forceFill([
            'gif_url' => 'https://example.com/temporary.gif',
            'gif_available' => true,
            'gif_checked_at' => null,
        ])->save();

        (new CheckExerciseGifJob($exercise->id))->handle();

        $exercise->refresh();

        $this->assertTrue($exercise->gif_available);
        $this->assertNotNull($exercise->gif_checked_at);
    }

    public function test_authenticated_user_can_create_routine_with_existing_exercise(): void
    {
        $this->seed(DatabaseSeeder::class);

        $user = User::query()->where('email', 'user1@gymapp.com')->firstOrFail();
        $exercise = $this->createExercise();
        $monday = Day::query()->where('slug', 'lunes')->firstOrFail();
        $thursday = Day::query()->where('slug', 'jueves')->firstOrFail();
        $sunday = Day::query()->where('slug', 'domingo')->firstOrFail();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/routines', [
            'name' => 'Rutina de prueba',
            'description' => 'Rutina creada desde prueba automatizada.',
            'days' => [$monday->id, $thursday->id, $sunday->id],
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'position' => 1,
                    'sets' => 3,
                    'reps' => 10,
                    'rest_seconds' => 60,
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Rutina de prueba')
            ->assertJsonPath('data.days.0.slug', 'lunes')
            ->assertJsonPath('data.days.1.slug', 'jueves')
            ->assertJsonPath('data.days.2.slug', 'domingo')
            ->assertJsonPath('data.exercises.0.pivot.sets', 3);
    }

    public function test_routine_days_reject_invalid_training_day_pairs(): void
    {
        $this->seed(DatabaseSeeder::class);

        $user = User::query()->where('email', 'user1@gymapp.com')->firstOrFail();
        $exercise = $this->createExercise();
        $monday = Day::query()->where('slug', 'lunes')->firstOrFail();
        $tuesday = Day::query()->where('slug', 'martes')->firstOrFail();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/routines', [
            'name' => 'Rutina mal planificada',
            'description' => 'Combinacion invalida de dias.',
            'days' => [$monday->id, $tuesday->id],
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'position' => 1,
                    'sets' => 3,
                    'reps' => 10,
                    'rest_seconds' => 60,
                ],
            ],
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('days');
    }

    public function test_admin_can_create_recommended_routine(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();
        $exercise = $this->createExercise();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/routines', [
            'name' => 'Rutina Recomendada',
            'description' => 'Rutina recomendada por el admin.',
            'is_predefined' => true,
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'position' => 1,
                    'sets' => 4,
                    'reps' => 8,
                    'rest_seconds' => 90,
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Rutina Recomendada')
            ->assertJsonPath('data.is_predefined', true);

        $this->assertSame(1, Routine::query()->where('name', 'Rutina Recomendada')->where('is_predefined', true)->count());
    }

    public function test_routine_index_only_exposes_visible_routines_for_regular_users(): void
    {
        $this->seed(DatabaseSeeder::class);

        $user = User::query()->where('email', 'user1@gymapp.com')->firstOrFail();
        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();
        $user2 = User::query()->where('email', 'user2@gymapp.com')->firstOrFail();
        $exercise = $this->createExercise();

        $this->createRoutine($admin, 'Rutina Recomendada', true, $exercise);
        $this->createRoutine($user, 'Rutina Privada Usuario 1', false, $exercise);
        $this->createRoutine($user2, 'Rutina Privada Usuario 2', false, $exercise);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/routines');

        $response->assertOk();

        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains('Rutina Recomendada'));
        $this->assertTrue($names->contains('Rutina Privada Usuario 1'));
        $this->assertFalse($names->contains('Rutina Privada Usuario 2'));
    }

    public function test_user_cannot_view_another_users_private_routine(): void
    {
        $this->seed(DatabaseSeeder::class);

        $user = User::query()->where('email', 'user1@gymapp.com')->firstOrFail();
        $user2 = User::query()->where('email', 'user2@gymapp.com')->firstOrFail();
        $exercise = $this->createExercise();
        $otherRoutine = $this->createRoutine($user2, 'Rutina Privada Usuario 2', false, $exercise);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/routines/'.$otherRoutine->id)
            ->assertForbidden();
    }

    public function test_admin_user_detail_does_not_expose_private_routines_from_other_users(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();
        $user = User::query()->where('email', 'user2@gymapp.com')->firstOrFail();
        $exercise = $this->createExercise();
        $this->createRoutine($user, 'Rutina Privada Usuario 2', false, $exercise);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/users/'.$user->id);

        $response->assertOk();
        $this->assertSame([], $response->json('data.routines'));
    }

    public function test_admin_can_create_membership_with_final_contract(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();
        $user = User::query()->where('email', 'user3@gymapp.com')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/memberships', [
            'user_id' => $user->id,
            'plan_type' => 'monthly',
            'starts_at' => now()->toDateString(),
            'ends_at' => now()->addMonth()->toDateString(),
            'status' => 'active',
            'price' => 120000,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.plan_type', 'monthly')
            ->assertJsonPath('data.plan_label', 'Mensual');
    }

    public function test_admin_can_create_regular_user_with_membership_in_same_form(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/users', [
            'role_slug' => 'user',
            'name' => 'Nuevo Usuario',
            'username' => 'nuevo.usuario',
            'email' => 'nuevo.usuario@gymapp.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'is_active' => true,
            'membership_plan_type' => 'monthly',
            'membership_notes' => 'Alta creada desde el formulario de admin.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.email', 'nuevo.usuario@gymapp.com')
            ->assertJsonPath('data.latest_membership.plan_type', 'monthly')
            ->assertJsonPath('data.latest_membership.plan_label', 'Mensual');

        $createdUser = User::query()->where('email', 'nuevo.usuario@gymapp.com')->firstOrFail();
        $membership = $createdUser->latestMembership;

        $this->assertSame(1, Membership::query()->where('user_id', $createdUser->id)->count());
        $this->assertSame('monthly', $membership?->plan_type);
        $this->assertSame(now()->addDays(30)->toDateString(), $membership?->ends_at?->toDateString());
    }

    public function test_admin_can_create_admin_without_membership_fields(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/users', [
            'role_slug' => 'admin',
            'name' => 'Nuevo Admin',
            'username' => 'nuevo.admin',
            'email' => 'nuevo.admin@gymapp.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'is_active' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.email', 'nuevo.admin@gymapp.com')
            ->assertJsonPath('data.latest_membership', null);

        $createdUser = User::query()->where('email', 'nuevo.admin@gymapp.com')->firstOrFail();
        $this->assertSame(0, Membership::query()->where('user_id', $createdUser->id)->count());
    }

    public function test_admin_user_list_excludes_admin_accounts(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/users');

        $response->assertOk();

        $emails = collect($response->json('data'))->pluck('email');

        $this->assertFalse($emails->contains('admin@gymapp.com'));
        $this->assertTrue($emails->contains('user1@gymapp.com'));
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/users?role=admin');

        $response->assertOk();

        $emails = collect($response->json('data'))->pluck('email');

        $this->assertTrue($emails->contains('admin@gymapp.com'));
        $this->assertFalse($emails->contains('user1@gymapp.com'));
    }

    public function test_admin_can_load_upcoming_memberships_with_string_days_parameter(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/memberships/upcoming?days=30&per_page=5');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data',
                'message',
            ]);
    }

    public function test_admin_exercise_sync_reports_configuration_error_without_crashing(): void
    {
        $this->seed(DatabaseSeeder::class);

        config([
            'services.exercise_db.base_url' => null,
            'services.exercise_api.url' => null,
        ]);

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/exercises/sync');

        $response
            ->assertOk()
            ->assertJsonPath('data.created', 0)
            ->assertJsonPath('data.updated', 0)
            ->assertJsonPath('data.total', 0)
            ->assertJsonCount(1, 'data.errors');
    }

    public function test_admin_exercise_sync_uses_external_id_as_the_local_identity(): void
    {
        $this->seed(DatabaseSeeder::class);

        $client = new class extends ExternalExerciseApiClient
        {
            public int $musclesCalls = 0;

            public int $bodyPartsCalls = 0;

            public array $exerciseQueries = [];

            public function fetchMuscles(): array
            {
                $this->musclesCalls++;

                return [
                    ['name' => 'pectorals'],
                    ['name' => 'shoulders'],
                ];
            }

            public function fetchBodyParts(): array
            {
                $this->bodyPartsCalls++;

                return [
                    ['name' => 'chest'],
                    ['name' => 'shoulders'],
                ];
            }

            public function fetchExercises(array $query = []): array
            {
                $this->exerciseQueries[] = $query;

                return [
                    'items' => [
                        [
                            'exerciseId' => 'incline-bench-press',
                            'name' => 'Incline Bench Press',
                            'bodyParts' => ['chest'],
                            'targetMuscles' => ['pectorals'],
                            'secondaryMuscles' => ['triceps', 'anterior deltoids'],
                            'equipments' => ['barbell', 'bench'],
                            'gifUrl' => 'https://example.com/bench.gif',
                            'instructions' => [
                                'Lie on a flat bench with your feet planted firmly on the floor.',
                                'Lower the bar to mid-chest and press back to the starting position.',
                            ],
                        ],
                    ],
                    'meta' => ['nextCursor' => null],
                ];
            }
        };

        config(['services.exercise_db.source' => 'exercise_db_v1']);

        $service = new ExerciseDbSyncService($client);
        $firstResult = $service->sync();

        $this->assertSame(1, $firstResult['created']);
        $this->assertSame(0, $firstResult['updated']);
        $this->assertSame(1, $firstResult['total']);

        $exercise = Exercise::query()->where('external_id', 'incline-bench-press')->firstOrFail();
        $this->assertSame('exercise_db_v1', $exercise->source);
        $this->assertSame('Incline Bench Press', $exercise->name_original);
        $this->assertSame(['barbell', 'bench'], $exercise->equipment);
        $this->assertSame(['triceps', 'anterior deltoids'], $exercise->secondary_muscles);
        $this->assertSame('chest', $exercise->body_part);
        $this->assertSame('pectorals', $exercise->target_muscle);

        config(['services.exercise_db.source' => 'exercise_db_v2']);

        $secondResult = $service->sync();

        $this->assertSame(0, $secondResult['created']);
        $this->assertSame(1, $secondResult['updated']);
        $this->assertSame(1, $secondResult['total']);

        $this->assertSame(1, Exercise::query()->where('external_id', 'incline-bench-press')->count());
        $exercise->refresh();
        $this->assertSame('exercise_db_v2', $exercise->source);
    }

    public function test_exercise_sync_keeps_only_muscles_used_by_exercises(): void
    {
        $this->seed(DatabaseSeeder::class);

        $staleMuscle = Muscle::query()->create([
            'name_en' => 'Hands',
            'name_es' => 'Hands',
            'slug' => 'hands',
        ]);

        $client = new class extends ExternalExerciseApiClient
        {
            public function fetchMuscles(): array
            {
                return [
                    ['name' => 'hands'],
                    ['name' => 'pectorals'],
                    ['name' => 'biceps'],
                ];
            }

            public function fetchBodyParts(): array
            {
                return [['name' => 'chest']];
            }

            public function fetchExercises(array $query = []): array
            {
                return [
                    'items' => [
                        [
                            'exerciseId' => 'bench-press',
                            'name' => 'Bench Press',
                            'bodyParts' => ['chest'],
                            'targetMuscles' => ['pectorals'],
                            'instructions' => ['Press the bar.'],
                        ],
                        [
                            'exerciseId' => 'biceps-curl',
                            'name' => 'Biceps Curl',
                            'bodyParts' => ['arms'],
                            'targetMuscles' => ['biceps'],
                            'instructions' => ['Curl the bar.'],
                        ],
                    ],
                    'meta' => ['nextCursor' => null],
                ];
            }
        };

        $service = new ExerciseDbSyncService($client);
        $service->sync();

        $this->assertDatabaseMissing('muscles', ['id' => $staleMuscle->id]);
        $slugs = Muscle::query()->pluck('slug')->all();
        sort($slugs);

        $this->assertSame(['biceps', 'pectorals'], $slugs);
    }

    public function test_exercise_sync_dispatches_muscle_translation_jobs_before_instruction_jobs(): void
    {
        $this->seed(DatabaseSeeder::class);
        Queue::fake();

        $client = new class extends ExternalExerciseApiClient
        {
            public function fetchMuscles(): array
            {
                return [['name' => 'pectorals']];
            }

            public function fetchBodyParts(): array
            {
                return [['name' => 'chest']];
            }

            public function fetchExercises(array $query = []): array
            {
                return [
                    'items' => [
                        [
                            'exerciseId' => 'bench-press',
                            'name' => 'Bench Press',
                            'bodyParts' => ['chest'],
                            'targetMuscles' => ['pectorals'],
                            'instructions' => ['Press the bar.'],
                        ],
                    ],
                    'meta' => ['nextCursor' => null],
                ];
            }
        };

        (new ExerciseDbSyncService($client))->sync();

        $this->assertDatabaseHas('muscles', [
            'slug' => 'pectorals',
            'name_en' => 'pectorals',
            'name_es' => null,
        ]);
        Queue::assertPushed(TranslateMuscleJob::class, 1);
        Queue::assertPushed(TranslateExerciseJob::class, 1);
    }

    public function test_translate_muscle_job_translates_missing_spanish_name(): void
    {
        $this->seed(DatabaseSeeder::class);

        $muscle = Muscle::query()->create([
            'name_en' => 'pectorals',
            'name_es' => null,
            'slug' => 'pectorals',
        ]);

        $translator = new class extends LibreTranslateClient
        {
            public function translateMany(array $texts, string $source = 'en', string $target = 'es'): array
            {
                return array_map(fn (string $text) => match ($text) {
                    'pectorals' => 'pectorales',
                    default => 'ES: '.$text,
                }, $texts);
            }
        };

        (new TranslateMuscleJob($muscle->id))->handle($translator);

        $muscle->refresh();

        $this->assertSame('pectorales', $muscle->name_es);
    }

    public function test_translate_muscle_job_uses_curated_dictionary_before_translator(): void
    {
        $this->seed(DatabaseSeeder::class);

        $muscle = Muscle::query()->create([
            'name_en' => 'calves',
            'name_es' => null,
            'slug' => 'calves',
        ]);

        $translator = new class extends LibreTranslateClient
        {
            public function translateMany(array $texts, string $source = 'en', string $target = 'es'): array
            {
                throw new RuntimeException('Translator should not be called for dictionary muscles.');
            }
        };

        (new TranslateMuscleJob($muscle->id))->handle($translator);

        $muscle->refresh();

        $this->assertSame('pantorrillas', $muscle->name_es);
    }

    public function test_translate_exercise_job_translates_instructions_without_touching_names(): void
    {
        $this->seed(DatabaseSeeder::class);

        $exercise = $this->createExercise();
        $exercise->forceFill([
            'name_original' => 'Bench Press',
            'name_es' => 'Press de banca',
            'instructions_original' => [
                'Lie on a flat bench.',
                'Press the bar upward.',
            ],
            'instructions_es' => null,
            'description_es' => null,
        ])->save();

        $translator = new class extends LibreTranslateClient
        {
            public function translateMany(array $texts, string $source = 'en', string $target = 'es'): array
            {
                return array_map(fn (string $text) => 'ES: '.$text, $texts);
            }
        };

        (new TranslateExerciseJob($exercise->id))->handle($translator);

        $exercise->refresh();

        $this->assertSame('Bench Press', $exercise->name_original);
        $this->assertSame('Press de banca', $exercise->name_es);
        $this->assertSame([
            'ES: Lie on a flat bench.',
            'ES: Press the bar upward.',
        ], $exercise->instructions_es);
    }

    public function test_translate_exercise_job_can_force_retranslation_when_spanish_already_exists(): void
    {
        $this->seed(DatabaseSeeder::class);

        $exercise = $this->createExercise();
        $exercise->forceFill([
            'instructions_original' => [
                'Updated step one.',
                'Updated step two.',
            ],
            'instructions_es' => [
                'Traducción vieja uno.',
                'Traducción vieja dos.',
            ],
            'description_es' => 'Traducción vieja uno.'.PHP_EOL.'Traducción vieja dos.',
        ])->save();

        $translator = new class extends LibreTranslateClient
        {
            public function translateMany(array $texts, string $source = 'en', string $target = 'es'): array
            {
                return array_map(fn (string $text) => 'ES NUEVO: '.$text, $texts);
            }
        };

        (new TranslateExerciseJob($exercise->id, true))->handle($translator);

        $exercise->refresh();

        $this->assertSame([
            'ES NUEVO: Updated step one.',
            'ES NUEVO: Updated step two.',
        ], $exercise->instructions_es);
    }

    public function test_sync_dispatches_translation_jobs_only_for_records_missing_spanish_instructions(): void
    {
        $this->seed(DatabaseSeeder::class);
        Queue::fake();
        $muscle = Muscle::query()->updateOrCreate(
            ['slug' => 'pectorals'],
            [
                'name_en' => 'Pectorals',
                'name_es' => 'Pectorales',
            ]
        );

        Exercise::query()->updateOrCreate(
            ['external_id' => 'already-translated'],
            [
                'muscle_id' => $muscle->id,
                'source' => 'exercise_db_v1',
                'name_original' => 'Already Translated',
                'name_es' => null,
                'body_part' => 'chest',
                'target_muscle' => 'pectorals',
                'secondary_muscles' => ['triceps'],
                'equipment' => ['barbell'],
                'gif_url' => null,
                'instructions_original' => ['Original step'],
                'instructions_es' => ['Paso traducido'],
                'raw_payload' => ['exerciseId' => 'already-translated'],
                'synced_at' => now(),
                'name_en' => 'Already Translated',
                'description_en' => 'Original step',
                'description_es' => 'Paso traducido',
            ]
        );

        Exercise::query()->updateOrCreate(
            ['external_id' => 'needs-translation'],
            [
                'muscle_id' => $muscle->id,
                'source' => 'exercise_db_v1',
                'name_original' => 'Needs Translation',
                'name_es' => null,
                'body_part' => 'chest',
                'target_muscle' => 'pectorals',
                'secondary_muscles' => ['triceps'],
                'equipment' => ['barbell'],
                'gif_url' => null,
                'instructions_original' => ['Original step'],
                'instructions_es' => null,
                'raw_payload' => ['exerciseId' => 'needs-translation'],
                'synced_at' => now(),
                'name_en' => 'Needs Translation',
                'description_en' => 'Original step',
                'description_es' => null,
            ]
        );

        $client = new class extends ExternalExerciseApiClient
        {
            public function fetchMuscles(): array
            {
                return [['name' => 'pectorals']];
            }

            public function fetchBodyParts(): array
            {
                return [['name' => 'chest']];
            }

            public function fetchExercises(array $query = []): array
            {
                return [
                    'items' => [
                        [
                            'exerciseId' => 'already-translated',
                            'name' => 'Already Translated',
                            'bodyParts' => ['chest'],
                            'targetMuscles' => ['pectorals'],
                            'secondaryMuscles' => ['triceps'],
                            'equipments' => ['barbell'],
                            'instructions' => ['Original step'],
                            'instructions_es' => ['Paso traducido'],
                        ],
                        [
                            'exerciseId' => 'needs-translation',
                            'name' => 'Needs Translation',
                            'bodyParts' => ['chest'],
                            'targetMuscles' => ['pectorals'],
                            'secondaryMuscles' => ['triceps'],
                            'equipments' => ['barbell'],
                            'instructions' => ['Original step'],
                        ],
                        [
                            'exerciseId' => 'brand-new',
                            'name' => 'Brand New',
                            'bodyParts' => ['chest'],
                            'targetMuscles' => ['pectorals'],
                            'secondaryMuscles' => ['triceps'],
                            'equipments' => ['barbell'],
                            'instructions' => ['New original step'],
                        ],
                    ],
                    'meta' => ['nextCursor' => null],
                ];
            }
        };

        $service = new ExerciseDbSyncService($client);
        $service->sync();

        Queue::assertPushed(TranslateExerciseJob::class, 2);
        Queue::assertPushed(TranslateExerciseJob::class, function (TranslateExerciseJob $job): bool {
            return Exercise::query()->find($job->exerciseId)?->external_id === 'needs-translation';
        });
        Queue::assertPushed(TranslateExerciseJob::class, function (TranslateExerciseJob $job): bool {
            return Exercise::query()->find($job->exerciseId)?->external_id === 'brand-new';
        });
    }

    public function test_sync_preserves_existing_spanish_instructions_when_source_does_not_send_them(): void
    {
        $this->seed(DatabaseSeeder::class);
        Queue::fake();

        $muscle = Muscle::query()->updateOrCreate(
            ['slug' => 'pectorals'],
            [
                'name_en' => 'Pectorals',
                'name_es' => 'Pectorales',
            ]
        );

        $exercise = Exercise::query()->updateOrCreate(
            ['external_id' => 'preserve-translation'],
            [
                'muscle_id' => $muscle->id,
                'source' => 'exercise_db_v1',
                'name_original' => 'Preserve Translation',
                'name_es' => null,
                'body_part' => 'chest',
                'target_muscle' => 'pectorals',
                'secondary_muscles' => ['triceps'],
                'equipment' => ['barbell'],
                'gif_url' => null,
                'instructions_original' => ['Original step'],
                'instructions_es' => ['Paso traducido'],
                'raw_payload' => ['exerciseId' => 'preserve-translation'],
                'synced_at' => now(),
                'name_en' => 'Preserve Translation',
                'description_en' => 'Original step',
                'description_es' => 'Paso traducido',
            ]
        );

        $client = new class extends ExternalExerciseApiClient
        {
            public function fetchMuscles(): array
            {
                return [['name' => 'pectorals']];
            }

            public function fetchBodyParts(): array
            {
                return [['name' => 'chest']];
            }

            public function fetchExercises(array $query = []): array
            {
                return [
                    'items' => [
                        [
                            'exerciseId' => 'preserve-translation',
                            'name' => 'Preserve Translation',
                            'bodyParts' => ['chest'],
                            'targetMuscles' => ['pectorals'],
                            'secondaryMuscles' => ['triceps'],
                            'equipments' => ['barbell'],
                            'instructions' => ['Original step'],
                        ],
                    ],
                    'meta' => ['nextCursor' => null],
                ];
            }
        };

        $service = new ExerciseDbSyncService($client);
        $result = $service->sync();

        $exercise->refresh();

        $this->assertSame(0, $result['updated']);
        $this->assertSame(['Paso traducido'], $exercise->instructions_es);
        $this->assertSame('Paso traducido', $exercise->description_es);
        Queue::assertNotPushed(TranslateExerciseJob::class);
    }

    public function test_sync_dispatches_forced_retranslation_when_original_instructions_change(): void
    {
        $this->seed(DatabaseSeeder::class);
        Queue::fake();

        $muscle = Muscle::query()->updateOrCreate(
            ['slug' => 'pectorals'],
            [
                'name_en' => 'Pectorals',
                'name_es' => 'Pectorales',
            ]
        );

        Exercise::query()->updateOrCreate(
            ['external_id' => 'needs-refresh'],
            [
                'muscle_id' => $muscle->id,
                'source' => 'exercise_db_v1',
                'name_original' => 'Needs Refresh',
                'name_es' => null,
                'body_part' => 'chest',
                'target_muscle' => 'pectorals',
                'secondary_muscles' => ['triceps'],
                'equipment' => ['barbell'],
                'gif_url' => null,
                'instructions_original' => ['Old step'],
                'instructions_es' => ['Paso viejo'],
                'raw_payload' => ['exerciseId' => 'needs-refresh'],
                'synced_at' => now(),
                'name_en' => 'Needs Refresh',
                'description_en' => 'Old step',
                'description_es' => 'Paso viejo',
            ]
        );

        $client = new class extends ExternalExerciseApiClient
        {
            public function fetchMuscles(): array
            {
                return [['name' => 'pectorals']];
            }

            public function fetchBodyParts(): array
            {
                return [['name' => 'chest']];
            }

            public function fetchExercises(array $query = []): array
            {
                return [
                    'items' => [
                        [
                            'exerciseId' => 'needs-refresh',
                            'name' => 'Needs Refresh',
                            'bodyParts' => ['chest'],
                            'targetMuscles' => ['pectorals'],
                            'secondaryMuscles' => ['triceps'],
                            'equipments' => ['barbell'],
                            'instructions' => ['New step'],
                        ],
                    ],
                    'meta' => ['nextCursor' => null],
                ];
            }
        };

        $service = new ExerciseDbSyncService($client);
        $service->sync();

        Queue::assertPushed(TranslateExerciseJob::class, function (TranslateExerciseJob $job): bool {
            return Exercise::query()->find($job->exerciseId)?->external_id === 'needs-refresh'
                && $job->force === true;
        });
    }

    private function createExercise(): Exercise
    {
        $muscle = Muscle::query()->updateOrCreate(
            ['slug' => 'chest'],
            [
                'name_en' => 'Chest',
                'name_es' => 'Pecho',
            ]
        );

        return Exercise::query()->updateOrCreate(
            ['external_id' => 'bench-press'],
            [
                'muscle_id' => $muscle->id,
                'source' => 'exercise_api',
                'name_original' => 'Bench Press',
                'name_es' => 'Press de banca',
                'body_part' => 'Chest',
                'target_muscle' => 'Pectorals',
                'secondary_muscles' => ['Triceps', 'Anterior Deltoids'],
                'equipment' => ['Barbell', 'Bench'],
                'instructions_original' => ['Lie on a flat bench with your feet planted firmly on the floor.'],
                'instructions_es' => ['Acuéstate en un banco plano con los pies firmes en el suelo.'],
                'raw_payload' => [
                    'id' => 'bench-press',
                    'name' => 'Bench Press',
                ],
                'synced_at' => now(),
                'name_en' => 'Bench Press',
                'description_en' => 'Lie on a flat bench with your feet planted firmly on the floor.',
                'description_es' => 'Acuéstate en un banco plano con los pies firmes en el suelo.',
            ]
        );
    }

    private function createRoutine(User $user, string $name, bool $isPredefined, Exercise $exercise): Routine
    {
        $routine = Routine::query()->create([
            'user_id' => $user->id,
            'name' => $name,
            'description' => $name.' description',
            'is_predefined' => $isPredefined,
        ]);

        $routine->exercises()->attach($exercise->id, [
            'position' => 1,
            'sets' => 3,
            'reps' => 10,
            'rest_seconds' => 60,
            'notes' => null,
        ]);

        return $routine;
    }
}
