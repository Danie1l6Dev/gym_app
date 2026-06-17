<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\Day;
use App\Models\Routine;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoutinesSeeder extends Seeder
{
    public function run(): void
    {
        $exerciseIds = [
            'bench_press' => Exercise::query()->where('external_id', 'bench-press')->value('id'),
            'back_squat' => Exercise::query()->where('external_id', 'back-squat')->value('id'),
            'barbell_curl' => Exercise::query()->where('external_id', 'barbell-curl')->value('id'),
            'deadlift' => Exercise::query()->where('external_id', 'deadlift')->value('id'),
            'military_press' => Exercise::query()->where('external_id', 'standing-military-press')->value('id'),
            'rope_pushdown' => Exercise::query()->where('external_id', 'rope-pushdown')->value('id'),
            'plank' => Exercise::query()->where('external_id', 'plank')->value('id'),
            'hip_thrust' => Exercise::query()->where('external_id', 'hip-thrust')->value('id'),
        ];

        $dayIds = Day::query()->pluck('id', 'slug');

        $admin = User::query()->where('email', 'admin@gymapp.com')->firstOrFail();
        $user1 = User::query()->where('email', 'user1@gymapp.com')->firstOrFail();
        $user2 = User::query()->where('email', 'user2@gymapp.com')->firstOrFail();
        $user4 = User::query()->where('email', 'user4@gymapp.com')->firstOrFail();

        $routines = [
            [
                'user' => $admin,
                'name' => 'Push Pull Legs',
                'description' => 'Rutina semanal clasica para volumen y progresion.',
                'is_predefined' => true,
                'days' => ['lunes', 'jueves'],
                'exercises' => [
                    ['id' => $exerciseIds['bench_press'], 'position' => 1, 'sets' => 4, 'reps' => 8, 'rest_seconds' => 90, 'notes' => 'Mantener tecnica estricta.'],
                    ['id' => $exerciseIds['military_press'], 'position' => 2, 'sets' => 4, 'reps' => 10, 'rest_seconds' => 90, 'notes' => 'Control en la fase excéntrica.'],
                    ['id' => $exerciseIds['rope_pushdown'], 'position' => 3, 'sets' => 3, 'reps' => 12, 'rest_seconds' => 60, 'notes' => 'Enfocar en triceps.'],
                ],
            ],
            [
                'user' => $admin,
                'name' => 'Full Body',
                'description' => 'Rutina completa para usuarios que entrenan tres dias.',
                'is_predefined' => true,
                'days' => ['martes', 'viernes'],
                'exercises' => [
                    ['id' => $exerciseIds['back_squat'], 'position' => 1, 'sets' => 4, 'reps' => 8, 'rest_seconds' => 120, 'notes' => 'Priorizar profundidad.'],
                    ['id' => $exerciseIds['deadlift'], 'position' => 2, 'sets' => 3, 'reps' => 6, 'rest_seconds' => 150, 'notes' => 'Carga moderada.'],
                    ['id' => $exerciseIds['plank'], 'position' => 3, 'sets' => 3, 'reps' => 45, 'rest_seconds' => 45, 'notes' => '45 segundos por serie.'],
                ],
            ],
            [
                'user' => $user1,
                'name' => 'Rutina Principiante',
                'description' => 'Enfoque en tecnica, adaptacion y consistencia.',
                'is_predefined' => false,
                'days' => ['miercoles', 'sabado'],
                'exercises' => [
                    ['id' => $exerciseIds['back_squat'], 'position' => 1, 'sets' => 3, 'reps' => 10, 'rest_seconds' => 90, 'notes' => 'Peso ligero-moderado.'],
                    ['id' => $exerciseIds['bench_press'], 'position' => 2, 'sets' => 3, 'reps' => 10, 'rest_seconds' => 90, 'notes' => 'Asegurar rango completo.'],
                    ['id' => $exerciseIds['barbell_curl'], 'position' => 3, 'sets' => 3, 'reps' => 12, 'rest_seconds' => 60, 'notes' => 'Movimiento controlado.'],
                ],
            ],
            [
                'user' => $user2,
                'name' => 'Rutina Hipertrofia',
                'description' => 'Rutina orientada a volumen muscular.',
                'is_predefined' => false,
                'days' => ['lunes', 'jueves', 'domingo'],
                'exercises' => [
                    ['id' => $exerciseIds['bench_press'], 'position' => 1, 'sets' => 4, 'reps' => 8, 'rest_seconds' => 90, 'notes' => 'Progresar carga semanalmente.'],
                    ['id' => $exerciseIds['hip_thrust'], 'position' => 2, 'sets' => 4, 'reps' => 12, 'rest_seconds' => 75, 'notes' => 'Foco en gluteos.'],
                    ['id' => $exerciseIds['barbell_curl'], 'position' => 3, 'sets' => 3, 'reps' => 12, 'rest_seconds' => 60, 'notes' => 'Mantener codos fijos.'],
                    ['id' => $exerciseIds['plank'], 'position' => 4, 'sets' => 3, 'reps' => 40, 'rest_seconds' => 45, 'notes' => '40 segundos por serie.'],
                ],
            ],
            [
                'user' => $user4,
                'name' => 'Rutina Upper Lower',
                'description' => 'Divide el entrenamiento en tren superior e inferior.',
                'is_predefined' => false,
                'days' => ['martes', 'viernes'],
                'exercises' => [
                    ['id' => $exerciseIds['military_press'], 'position' => 1, 'sets' => 4, 'reps' => 8, 'rest_seconds' => 90, 'notes' => 'Tren superior.'],
                    ['id' => $exerciseIds['deadlift'], 'position' => 2, 'sets' => 4, 'reps' => 6, 'rest_seconds' => 150, 'notes' => 'Tren inferior.'],
                    ['id' => $exerciseIds['rope_pushdown'], 'position' => 3, 'sets' => 3, 'reps' => 12, 'rest_seconds' => 60, 'notes' => 'Accesorio de brazos.'],
                ],
            ],
        ];

        foreach ($routines as $routineData) {
            $routine = Routine::updateOrCreate(
                [
                    'user_id' => $routineData['user']->id,
                    'name' => $routineData['name'],
                ],
                [
                    'description' => $routineData['description'],
                    'is_predefined' => $routineData['is_predefined'],
                ]
            );

            $routine->exercises()->sync(
                collect($routineData['exercises'])->mapWithKeys(function (array $exercise): array {
                    return [
                        $exercise['id'] => [
                            'position' => $exercise['position'],
                            'sets' => $exercise['sets'],
                            'reps' => $exercise['reps'],
                            'rest_seconds' => $exercise['rest_seconds'],
                            'notes' => $exercise['notes'],
                        ],
                    ];
                })->all()
            );

            $routine->days()->sync(
                collect($routineData['days'] ?? [])
                    ->map(fn (string $slug): ?int => $dayIds->get($slug))
                    ->filter()
                    ->values()
                    ->all()
            );
        }
    }
}
