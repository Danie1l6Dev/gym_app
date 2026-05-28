<?php

namespace App\Services\Exercises;

use App\Models\Exercise;
use App\Models\Muscle;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class ExerciseSyncService
{
    public function __construct(
        private readonly ExternalExerciseApiClient $client,
    ) {
    }

    public function sync(): array
    {
        $payload = $this->client->fetch();

        $created = 0;
        $updated = 0;

        foreach ($payload as $item) {
            $normalized = $this->normalize($item);

            if (! $normalized) {
                continue;
            }

            $muscle = Muscle::firstOrCreate(
                ['slug' => $normalized['muscle_slug']],
                [
                    'name_en' => $normalized['muscle_name_en'],
                    'name_es' => $normalized['muscle_name_es'],
                ]
            );

            $exercise = Exercise::updateOrCreate(
                [
                    'source' => $normalized['source'],
                    'external_id' => $normalized['external_id'],
                ],
                [
                    'muscle_id' => $muscle->id,
                    'name_en' => $normalized['name_en'],
                    'name_es' => $normalized['name_es'],
                    'description_en' => $normalized['description_en'],
                    'description_es' => $normalized['description_es'],
                    'gif_url' => $normalized['gif_url'],
                    'source_payload' => $normalized['source_payload'],
                    'synced_at' => now(),
                ]
            );

            $exercise->wasRecentlyCreated ? $created++ : $updated++;
        }

        return [
            'created' => $created,
            'updated' => $updated,
        ];
    }

    private function normalize(array $item): ?array
    {
        $externalId = (string) (Arr::get($item, 'id') ?? Arr::get($item, 'external_id') ?? Arr::get($item, 'uuid'));
        $nameEn = Arr::get($item, 'name_en') ?? Arr::get($item, 'name') ?? Arr::get($item, 'nameEnglish');
        $descriptionEn = Arr::get($item, 'description_en') ?? Arr::get($item, 'description');
        $gifUrl = Arr::get($item, 'gif_url') ?? Arr::get($item, 'gifUrl');
        $muscleName = Arr::get($item, 'target_muscle') ?? Arr::get($item, 'muscle') ?? Arr::get($item, 'targetMuscle');

        if ($externalId === '' || ! $nameEn || ! $muscleName) {
            return null;
        }

        $nameEn = trim((string) $nameEn);
        $muscleName = trim((string) $muscleName);

        return [
            'source' => (string) config('services.exercise_api.source', 'exercise_api'),
            'external_id' => $externalId,
            'name_en' => $nameEn,
            'name_es' => Arr::get($item, 'name_es'),
            'description_en' => is_string($descriptionEn) ? $descriptionEn : null,
            'description_es' => Arr::get($item, 'description_es'),
            'gif_url' => is_string($gifUrl) ? $gifUrl : null,
            'muscle_name_en' => $muscleName,
            'muscle_name_es' => Arr::get($item, 'target_muscle_es') ?? $muscleName,
            'muscle_slug' => Str::slug($muscleName),
            'source_payload' => $item,
        ];
    }
}
