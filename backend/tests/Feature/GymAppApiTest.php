<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\Membership;
use App\Models\Muscle;
use App\Models\Role;
use App\Models\Routine;
use App\Models\User;
use App\Services\Exercises\ExerciseDbSyncService;
use App\Services\Exercises\ExternalExerciseApiClient;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GymAppApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_creates_consistent_demo_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(2, Role::query()->count());
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

        $this->getJson('/api/v1/muscles')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'abs');

        $this->getJson('/api/v1/exercises?search=press')
            ->assertOk()
            ->assertJsonFragment(['name_es' => 'Press de banca']);
    }

    public function test_authenticated_user_can_create_routine_with_existing_exercise(): void
    {
        $this->seed(DatabaseSeeder::class);

        $user = User::query()->where('email', 'user1@gymapp.com')->firstOrFail();
        $exercise = $this->createExercise();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/routines', [
            'name' => 'Rutina de prueba',
            'description' => 'Rutina creada desde prueba automatizada.',
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
            ->assertJsonPath('data.exercises.0.pivot.sets', 3);
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
            'membership_ends_at' => now()->addMonth()->toDateString(),
            'membership_notes' => 'Alta creada desde el formulario de admin.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.email', 'nuevo.usuario@gymapp.com')
            ->assertJsonPath('data.latest_membership.plan_type', 'monthly')
            ->assertJsonPath('data.latest_membership.plan_label', 'Mensual');

        $createdUser = User::query()->where('email', 'nuevo.usuario@gymapp.com')->firstOrFail();
        $this->assertSame(1, Membership::query()->where('user_id', $createdUser->id)->count());
        $this->assertSame('monthly', $createdUser->latestMembership?->plan_type);
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
