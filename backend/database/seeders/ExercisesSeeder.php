<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\Muscle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ExercisesSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'muscle_slug' => 'chest',
                'source' => 'exercise_api',
                'external_id' => 'bench-press',
                'name_en' => 'Bench Press',
                'name_es' => 'Press de banca',
                'description_en' => 'Compound chest exercise performed on a flat bench.',
                'description_es' => 'Ejercicio compuesto de pecho realizado en banco plano.',
                'gif_url' => null,
            ],
            [
                'muscle_slug' => 'legs',
                'source' => 'exercise_api',
                'external_id' => 'back-squat',
                'name_en' => 'Back Squat',
                'name_es' => 'Sentadilla trasera',
                'description_en' => 'Fundamental lower-body movement for strength and hypertrophy.',
                'description_es' => 'Movimiento base de tren inferior para fuerza e hipertrofia.',
                'gif_url' => null,
            ],
            [
                'muscle_slug' => 'biceps',
                'source' => 'exercise_api',
                'external_id' => 'barbell-curl',
                'name_en' => 'Barbell Curl',
                'name_es' => 'Curl de barra',
                'description_en' => 'Classic biceps isolation movement.',
                'description_es' => 'Movimiento clasico de aislamiento para biceps.',
                'gif_url' => null,
            ],
            [
                'muscle_slug' => 'back',
                'source' => 'exercise_api',
                'external_id' => 'deadlift',
                'name_en' => 'Deadlift',
                'name_es' => 'Peso muerto',
                'description_en' => 'Full posterior-chain exercise that develops strength.',
                'description_es' => 'Ejercicio para toda la cadena posterior que desarrolla fuerza.',
                'gif_url' => null,
            ],
            [
                'muscle_slug' => 'shoulders',
                'source' => 'exercise_api',
                'external_id' => 'standing-military-press',
                'name_en' => 'Standing Military Press',
                'name_es' => 'Press militar de pie',
                'description_en' => 'Vertical pressing movement focused on the shoulders.',
                'description_es' => null,
                'gif_url' => null,
            ],
            [
                'muscle_slug' => 'triceps',
                'source' => 'exercise_api',
                'external_id' => 'rope-pushdown',
                'name_en' => 'Rope Pushdown',
                'name_es' => 'Pushdown con cuerda',
                'description_en' => 'Cable isolation exercise for triceps.',
                'description_es' => null,
                'gif_url' => null,
            ],
            [
                'muscle_slug' => 'abs',
                'source' => 'exercise_api',
                'external_id' => 'plank',
                'name_en' => 'Plank',
                'name_es' => 'Plancha',
                'description_en' => 'Core stability exercise performed with an isometric hold.',
                'description_es' => 'Ejercicio de estabilidad del core con contraccion isometrica.',
                'gif_url' => null,
            ],
            [
                'muscle_slug' => 'glutes',
                'source' => 'exercise_api',
                'external_id' => 'hip-thrust',
                'name_en' => 'Hip Thrust',
                'name_es' => 'Elevacion de cadera',
                'description_en' => 'Glute-dominant movement for lower-body development.',
                'description_es' => 'Movimiento dominante de gluteos para desarrollo de tren inferior.',
                'gif_url' => null,
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
                    'name_en' => $item['name_en'],
                    'name_es' => $item['name_es'],
                    'description_en' => $item['description_en'],
                    'description_es' => $item['description_es'],
                    'gif_url' => $item['gif_url'],
                    'source_payload' => [
                        'id' => $item['external_id'],
                        'name' => $item['name_en'],
                        'description' => $item['description_en'],
                        'target_muscle' => $muscle->name_en,
                        'gif_url' => $item['gif_url'],
                    ],
                    'synced_at' => now(),
                ]
            );
        }
    }
}
