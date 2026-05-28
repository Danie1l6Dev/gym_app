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
                'source' => 'exercise_api',
                'external_id' => 'bench-press',
                'name_original' => 'Bench Press',
                'name_es' => 'Press de banca',
                'body_part' => 'Chest',
                'target_muscle' => 'Pectorals',
                'secondary_muscles' => ['Triceps', 'Anterior Deltoids'],
                'equipment' => ['Barbell', 'Bench'],
                'gif_url' => null,
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
                'source' => 'exercise_api',
                'external_id' => 'back-squat',
                'name_original' => 'Back Squat',
                'name_es' => 'Sentadilla trasera',
                'body_part' => 'Legs',
                'target_muscle' => 'Quadriceps',
                'secondary_muscles' => ['Glutes', 'Hamstrings'],
                'equipment' => ['Barbell', 'Rack'],
                'gif_url' => null,
                'instructions_original' => [
                    'Keep your chest up and brace your core before descending.',
                    'Drive through your heels to stand back up.',
                ],
                'instructions_es' => [
                    'Mantén el pecho arriba y activa el core antes de bajar.',
                    'Empuja con los talones para volver a la posición inicial.',
                ],
            ],
        ];

        foreach ($items as $item) {
            $muscle = Muscle::query()->where('slug', $item['muscle_slug'])->firstOrFail();

            Exercise::updateOrCreate(
                [
                    'source' => $item['source'],
                    'external_id' => $item['external_id'],
                ],
                [
                    'muscle_id' => $muscle->id,
                    'name_original' => $item['name_original'],
                    'name_es' => $item['name_es'],
                    'body_part' => $item['body_part'],
                    'target_muscle' => $item['target_muscle'],
                    'secondary_muscles' => $item['secondary_muscles'],
                    'equipment' => $item['equipment'],
                    'gif_url' => $item['gif_url'],
                    'instructions_original' => $item['instructions_original'],
                    'instructions_es' => $item['instructions_es'],
                    'raw_payload' => [
                        'id' => $item['external_id'],
                        'name' => $item['name_original'],
                        'name_es' => $item['name_es'],
                        'body_part' => $item['body_part'],
                        'target_muscle' => $item['target_muscle'],
                        'secondary_muscles' => $item['secondary_muscles'],
                        'equipment' => $item['equipment'],
                        'instructions' => $item['instructions_original'],
                        'instructions_es' => $item['instructions_es'],
                        'gif_url' => $item['gif_url'],
                    ],
                    'synced_at' => now(),
                    // Legacy compatibility.
                    'name_en' => $item['name_original'],
                    'description_en' => implode(PHP_EOL, $item['instructions_original']),
                    'description_es' => implode(PHP_EOL, $item['instructions_es']),
                    'source_payload' => [
                        'id' => $item['external_id'],
                        'name' => $item['name_original'],
                        'description' => implode(PHP_EOL, $item['instructions_original']),
                        'target_muscle' => $item['target_muscle'],
                        'gif_url' => $item['gif_url'],
                    ],
                ]
            );
        }
    }
}
