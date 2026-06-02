<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\Muscle;
use Illuminate\Database\Seeder;

class ExercisesSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'muscle_slug' => 'chest',
                'external_id' => 'bench-press',
                'name_original' => 'Bench Press',
                'name_es' => 'Press de banca',
                'body_part' => 'Chest',
                'target_muscle' => 'Pectorals',
                'secondary_muscles' => ['Triceps', 'Anterior Deltoids'],
                'equipment' => ['Barbell', 'Bench'],
                'instructions_original' => [
                    'Lie on a flat bench with your feet planted firmly on the floor.',
                    'Lower the bar to mid-chest and press back to the starting position.',
                ],
                'instructions_es' => [
                    'Acuéstate en un banco plano con los pies firmes en el suelo.',
                    'Baja la barra al centro del pecho y empuja de regreso a la posición inicial.',
                ],
            ],
            [
                'muscle_slug' => 'legs',
                'external_id' => 'back-squat',
                'name_original' => 'Back Squat',
                'name_es' => 'Sentadilla trasera',
                'body_part' => 'Legs',
                'target_muscle' => 'Quadriceps',
                'secondary_muscles' => ['Glutes', 'Hamstrings'],
                'equipment' => ['Barbell', 'Rack'],
                'instructions_original' => [
                    'Keep your chest up and brace your core before descending.',
                    'Drive through your heels to stand back up.',
                ],
                'instructions_es' => [
                    'Mantén el pecho arriba y activa el core antes de bajar.',
                    'Empuja con los talones para volver a la posición inicial.',
                ],
            ],
            [
                'muscle_slug' => 'biceps',
                'external_id' => 'barbell-curl',
                'name_original' => 'Barbell Curl',
                'name_es' => 'Curl con barra',
                'body_part' => 'Arms',
                'target_muscle' => 'Biceps',
                'secondary_muscles' => ['Forearms'],
                'equipment' => ['Barbell'],
                'instructions_original' => [
                    'Stand tall with the barbell at hip height.',
                    'Curl the bar while keeping your elbows close to your torso.',
                ],
                'instructions_es' => [
                    'Ponte de pie con la barra a la altura de la cadera.',
                    'Flexiona los codos manteniéndolos cerca del torso.',
                ],
            ],
            [
                'muscle_slug' => 'back',
                'external_id' => 'deadlift',
                'name_original' => 'Deadlift',
                'name_es' => 'Peso muerto',
                'body_part' => 'Back',
                'target_muscle' => 'Erector Spinae',
                'secondary_muscles' => ['Glutes', 'Hamstrings'],
                'equipment' => ['Barbell'],
                'instructions_original' => [
                    'Brace your core and keep the bar close to your legs.',
                    'Stand up by extending hips and knees at the same time.',
                ],
                'instructions_es' => [
                    'Activa el core y mantén la barra cerca de las piernas.',
                    'Sube extendiendo cadera y rodillas al mismo tiempo.',
                ],
            ],
            [
                'muscle_slug' => 'shoulders',
                'external_id' => 'standing-military-press',
                'name_original' => 'Standing Military Press',
                'name_es' => 'Press militar de pie',
                'body_part' => 'Shoulders',
                'target_muscle' => 'Deltoids',
                'secondary_muscles' => ['Triceps'],
                'equipment' => ['Barbell'],
                'instructions_original' => [
                    'Start with the bar at shoulder height.',
                    'Press overhead without leaning back excessively.',
                ],
                'instructions_es' => [
                    'Inicia con la barra a la altura de los hombros.',
                    'Empuja por encima de la cabeza sin inclinarte demasiado.',
                ],
            ],
            [
                'muscle_slug' => 'triceps',
                'external_id' => 'rope-pushdown',
                'name_original' => 'Rope Pushdown',
                'name_es' => 'Extensión de tríceps con cuerda',
                'body_part' => 'Arms',
                'target_muscle' => 'Triceps',
                'secondary_muscles' => [],
                'equipment' => ['Cable', 'Rope'],
                'instructions_original' => [
                    'Keep your elbows fixed beside your torso.',
                    'Extend the rope down and separate the ends at the bottom.',
                ],
                'instructions_es' => [
                    'Mantén los codos fijos junto al torso.',
                    'Extiende la cuerda hacia abajo y separa las puntas al final.',
                ],
            ],
            [
                'muscle_slug' => 'abs',
                'external_id' => 'plank',
                'name_original' => 'Plank',
                'name_es' => 'Plancha',
                'body_part' => 'Core',
                'target_muscle' => 'Abs',
                'secondary_muscles' => ['Shoulders', 'Glutes'],
                'equipment' => ['Bodyweight'],
                'instructions_original' => [
                    'Keep elbows under shoulders and body in a straight line.',
                    'Hold the position while breathing steadily.',
                ],
                'instructions_es' => [
                    'Mantén los codos bajo los hombros y el cuerpo en línea recta.',
                    'Sostén la posición respirando de forma controlada.',
                ],
            ],
            [
                'muscle_slug' => 'glutes',
                'external_id' => 'hip-thrust',
                'name_original' => 'Hip Thrust',
                'name_es' => 'Hip thrust',
                'body_part' => 'Glutes',
                'target_muscle' => 'Glutes',
                'secondary_muscles' => ['Hamstrings'],
                'equipment' => ['Barbell', 'Bench'],
                'instructions_original' => [
                    'Rest your upper back on a bench and keep feet planted.',
                    'Drive hips upward and squeeze glutes at the top.',
                ],
                'instructions_es' => [
                    'Apoya la espalda alta en un banco y deja los pies firmes.',
                    'Eleva la cadera y contrae los glúteos arriba.',
                ],
            ],
        ];

        foreach ($items as $item) {
            $muscle = Muscle::query()->where('slug', $item['muscle_slug'])->firstOrFail();

            Exercise::updateOrCreate(
                [
                    'external_id' => $item['external_id'],
                ],
                [
                    'muscle_id' => $muscle->id,
                    'source' => 'exercise_api',
                    'external_id' => $item['external_id'],
                    'name_original' => $item['name_original'],
                    'name_es' => $item['name_es'],
                    'body_part' => $item['body_part'],
                    'target_muscle' => $item['target_muscle'],
                    'secondary_muscles' => $item['secondary_muscles'],
                    'equipment' => $item['equipment'],
                    'gif_url' => null,
                    'instructions_original' => $item['instructions_original'],
                    'instructions_es' => $item['instructions_es'],
                    'raw_payload' => [
                        'id' => $item['external_id'],
                        'name' => $item['name_original'],
                        'name_es' => $item['name_es'],
                        'body_part' => $item['body_part'],
                        'target_muscle' => $item['target_muscle'],
                    ],
                    'synced_at' => now(),
                    'name_en' => $item['name_original'],
                    'description_en' => implode(PHP_EOL, $item['instructions_original']),
                    'description_es' => implode(PHP_EOL, $item['instructions_es']),
                    'source_payload' => [
                        'id' => $item['external_id'],
                        'name' => $item['name_original'],
                        'description' => implode(PHP_EOL, $item['instructions_original']),
                        'target_muscle' => $item['target_muscle'],
                    ],
                ]
            );
        }
    }
}
