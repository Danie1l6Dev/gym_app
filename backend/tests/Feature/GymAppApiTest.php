<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\Membership;
use App\Models\Muscle;
use App\Models\Role;
use App\Models\Routine;
use App\Models\User;
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
        $exercise = Exercise::query()->where('external_id', 'bench-press')->firstOrFail();

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

    public function test_admin_exercise_sync_reports_configuration_error_without_crashing(): void
    {
        $this->seed(DatabaseSeeder::class);

        config(['services.exercise_db.base_url' => null]);

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

        $payload = [
            [
                'id' => 'incline-bench-press',
                'name' => 'Incline Bench Press',
                'name_es' => 'Press inclinado de banca',
                'body_part' => 'Chest',
                'target_muscle' => 'Pectorals',
                'secondary_muscles' => ['Triceps', 'Anterior Deltoids'],
                'equipment' => ['Barbell', 'Bench'],
                'gif' => 'https://example.com/bench.gif',
                'instructions' => [
                    'Lie on a flat bench with your feet planted firmly on the floor.',
                    'Lower the bar to mid-chest and press back to the starting position.',
                ],
            ],
        ];

        app()->instance(ExternalExerciseApiClient::class, new class($payload) extends ExternalExerciseApiClient
        {
            public function __construct(private readonly array $payload)
            {
            }

            public function fetchExercises(): array
            {
                return $this->payload;
            }
        });

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();

        config(['services.exercise_db.source' => 'exercise_db_v1']);

        $firstResponse = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/exercises/sync');

        $firstResponse
            ->assertOk()
            ->assertJsonPath('data.created', 1)
            ->assertJsonPath('data.updated', 0)
            ->assertJsonPath('data.total', 1);

        $exercise = Exercise::query()->where('external_id', 'incline-bench-press')->firstOrFail();
        $this->assertSame('exercise_db_v1', $exercise->source);
        $this->assertSame('Incline Bench Press', $exercise->name_original);
        $this->assertSame(['Barbell', 'Bench'], $exercise->equipment);

        config(['services.exercise_db.source' => 'exercise_db_v2']);

        $secondResponse = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/exercises/sync');

        $secondResponse
            ->assertOk()
            ->assertJsonPath('data.created', 0)
            ->assertJsonPath('data.updated', 1)
            ->assertJsonPath('data.total', 1);

        $this->assertSame(1, Exercise::query()->where('external_id', 'incline-bench-press')->count());
        $exercise->refresh();
        $this->assertSame('exercise_db_v2', $exercise->source);
    }
}
