<?php

namespace App\Services\Exercises;

use App\Models\Exercise;
use App\Models\Muscle;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class ExerciseDbSyncService
{
    public function __construct(
        private readonly ExternalExerciseApiClient $client,
    ) {
    }

    public function sync(): array
    {
        $summary = [
            'created' => 0,
            'updated' => 0,
            'omitted' => 0,
            'total' => 0,
            'errors' => [],
            'catalog' => [
                'muscles' => 0,
                'bodyparts' => 0,
            ],
        ];

        try {
            $muscles = $this->client->fetchMuscles();
            $bodyParts = $this->client->fetchBodyParts();
            $this->syncMuscles($muscles);
            $summary['catalog']['muscles'] = count($muscles);
            $summary['catalog']['bodyparts'] = count($bodyParts);
            usleep(8000000);
            $payload = $this->fetchAllExercises();
        } catch (Throwable $throwable) {
            Log::error('ExerciseDB sync fetch failed.', [
                'exception' => $throwable,
            ]);

            $summary['errors'][] = $this->buildErrorMessage('No se pudo obtener el catálogo externo.', $throwable);

            return $summary;
        }

        $summary['total'] = count($payload);

        foreach ($payload as $index => $item) {
            try {
                $normalized = $this->normalizeItem($item);

                if ($normalized === null) {
                    $summary['omitted']++;

                    continue;
                }

                $exercise = Exercise::query()
                    ->where('external_id', $normalized['external_id'])
                    ->first();

                if ($exercise === null) {
                    Exercise::create($normalized['attributes']);
                    $summary['created']++;

                    continue;
                }

                if ($this->isSameExercise($exercise, $normalized['attributes'])) {
                    $summary['omitted']++;

                    continue;
                }

                $exercise->fill($normalized['attributes']);
                $exercise->save();
                $summary['updated']++;
            } catch (Throwable $throwable) {
                Log::error('ExerciseDB sync item failed.', [
                    'index' => $index,
                    'payload' => $item,
                    'exception' => $throwable,
                ]);

                $summary['omitted']++;
                $summary['errors'][] = $this->buildErrorMessage(
                    sprintf('No se pudo sincronizar el ejercicio en la posición %d.', $index + 1),
                    $throwable
                );
            }
        }

        return $summary;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchAllExercises(): array
    {
        $items = [];
        $seen = [];
        $cursor = '';
        $pageCount = 0;

        do {
            $response = $this->client->fetchExercises([
                'limit' => 25,
                'after' => $cursor,
                'before' => '',
            ]);

            foreach ($response['items'] as $item) {
                $externalId = $this->extractExternalId($item);

                if ($externalId === null || isset($seen[$externalId])) {
                    continue;
                }

                $seen[$externalId] = true;
                $items[] = $item;
            }

            $cursor = (string) ($response['meta']['nextCursor'] ?? '');
            $pageCount++;

            if ($cursor !== '') {
                if ($pageCount % 10 === 0) {
                    sleep(12);
                } else {
                    usleep(400000);
                }
            }
        } while ($cursor !== '');

        return $items;
    }

    /**
     * @param array<int, array<string, mixed>> $muscles
     */
    private function syncMuscles(array $muscles): void
    {
        foreach ($muscles as $item) {
            $name = $this->firstString($item, ['name']);

            if ($name === null) {
                continue;
            }

            $slug = Str::slug($name);

            Muscle::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name_en' => $name,
                    'name_es' => $name,
                ]
            );
        }
    }

    private function normalizeItem(array $item): ?array
    {
        $externalId = $this->extractExternalId($item);

        $nameOriginal = $this->firstString($item, [
            'name_original',
            'name',
            'name_en',
            'title',
        ]);

        $bodyPart = $this->firstString($item, [
            'body_part',
            'bodyPart',
            'bodyParts',
        ]);

        $targetMuscle = $this->firstString($item, [
            'target_muscle',
            'targetMuscle',
            'targetMuscles',
            'muscle',
        ]);

        if ($nameOriginal === null || $externalId === null) {
            return null;
        }

        $targetMuscleName = $targetMuscle ?? $bodyPart;
        $muscle = $this->resolveMuscle($targetMuscleName);

        if ($muscle === null) {
            return null;
        }

        $secondaryMuscles = $this->normalizeStringList(
            Arr::get($item, 'secondary_muscles')
                ?? Arr::get($item, 'secondaryMuscles')
                ?? Arr::get($item, 'secondaryMuscle')
        );

        $equipment = $this->normalizeStringList(
            Arr::get($item, 'equipment')
                ?? Arr::get($item, 'equipments')
        );

        $instructionsOriginal = $this->normalizeStringList(
            Arr::get($item, 'instructions_original')
                ?? Arr::get($item, 'instructions')
                ?? Arr::get($item, 'instruction')
                ?? Arr::get($item, 'steps')
        );

        $instructionsEs = $this->normalizeStringList(
            Arr::get($item, 'instructions_es')
                ?? Arr::get($item, 'instructionsEs')
        );

        $gifUrl = $this->firstString($item, [
            'gif_url',
            'gifUrl',
            'gif',
            'image',
        ]);

        $nameEs = $this->firstString($item, [
            'name_es',
            'nameEs',
        ]);

        $rawPayload = $item;
        $instructionsOriginalText = $this->joinText($instructionsOriginal);
        $instructionsEsText = $this->joinText($instructionsEs);

        return [
            'source' => (string) (config('services.exercise_db.source') ?: config('services.exercise_api.source', 'exercise_db_v1')),
            'external_id' => $externalId,
            'attributes' => [
                'muscle_id' => $muscle->id,
                'source' => (string) (config('services.exercise_db.source') ?: config('services.exercise_api.source', 'exercise_db_v1')),
                'external_id' => $externalId,
                'name_original' => $nameOriginal,
                'name_es' => $nameEs,
                'body_part' => $bodyPart,
                'target_muscle' => $targetMuscleName,
                'secondary_muscles' => $secondaryMuscles ?: null,
                'equipment' => $equipment ?: null,
                'gif_url' => $gifUrl,
                'instructions_original' => $instructionsOriginal ?: null,
                'instructions_es' => $instructionsEs ?: null,
                'raw_payload' => $rawPayload,
                'synced_at' => now(),
                // Legacy compatibility fields while the rest of the app migrates.
                'name_en' => $nameOriginal,
                'description_en' => $instructionsOriginalText,
                'description_es' => $instructionsEsText,
            ],
        ];
    }

    private function resolveMuscle(?string $muscleName): ?Muscle
    {
        if ($muscleName === null || trim($muscleName) === '') {
            return null;
        }

        $muscleName = trim($muscleName);
        $slug = Str::slug($muscleName);

        $muscle = Muscle::query()
            ->where('slug', $slug)
            ->orWhere('name_en', $muscleName)
            ->orWhere('name_es', $muscleName)
            ->first();

        if ($muscle !== null) {
            return $muscle;
        }

        return Muscle::query()->create([
            'name_en' => $muscleName,
            'name_es' => $muscleName,
            'slug' => $slug,
        ]);
    }

    private function firstString(array $payload, array $keys): ?string
    {
        foreach ($keys as $key) {
            $value = Arr::get($payload, $key);
            $text = $this->stringValue($value);

            if ($text !== null) {
                return $text;
            }
        }

        return null;
    }

    private function extractExternalId(array $payload): ?string
    {
        return $this->firstString($payload, [
            'external_id',
            'exerciseId',
            'id',
            'exercise_id',
            'uuid',
        ]);
    }

    private function stringValue(mixed $value): ?string
    {
        if (is_string($value)) {
            $trimmed = trim($value);

            return $trimmed !== '' ? $trimmed : null;
        }

        if (is_numeric($value)) {
            $trimmed = trim((string) $value);

            return $trimmed !== '' ? $trimmed : null;
        }

        if (is_array($value)) {
            foreach (Arr::flatten($value) as $item) {
                if (is_string($item) || is_numeric($item)) {
                    $trimmed = trim((string) $item);

                    if ($trimmed !== '') {
                        return $trimmed;
                    }
                }
            }
        }

        return null;
    }

    private function normalizeStringList(mixed $value): array
    {
        if ($value === null) {
            return [];
        }

        if (is_string($value)) {
            $trimmed = trim($value);

            return $trimmed !== '' ? [$trimmed] : [];
        }

        if (! is_array($value)) {
            return [];
        }

        $items = [];

        foreach (Arr::flatten($value) as $item) {
            if (is_string($item) || is_numeric($item)) {
                $trimmed = trim((string) $item);

                if ($trimmed !== '') {
                    $items[] = $trimmed;
                }
            }
        }

        return array_values(array_unique($items));
    }

    private function extractNames(array $items): array
    {
        $names = [];

        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $name = $this->firstString($item, ['name', 'slug']);

            if ($name !== null) {
                $names[] = $name;
            }
        }

        return array_values(array_unique($names));
    }

    private function joinText(array $items): ?string
    {
        if ($items === []) {
            return null;
        }

        return implode(PHP_EOL, $items);
    }

    private function isSameExercise(Exercise $exercise, array $attributes): bool
    {
        $keys = [
            'muscle_id',
            'source',
            'external_id',
            'name_original',
            'name_es',
            'body_part',
            'target_muscle',
            'secondary_muscles',
            'equipment',
            'gif_url',
            'instructions_original',
            'instructions_es',
            'raw_payload',
            'name_en',
            'description_en',
            'description_es',
        ];

        foreach ($keys as $key) {
            if (! $this->valuesAreEquivalent($exercise->getAttribute($key), $attributes[$key] ?? null)) {
                return false;
            }
        }

        return true;
    }

    private function valuesAreEquivalent(mixed $current, mixed $incoming): bool
    {
        return $this->normalizeComparableValue($current) === $this->normalizeComparableValue($incoming);
    }

    private function normalizeComparableValue(mixed $value): mixed
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format(DATE_ATOM);
        }

        if (is_array($value)) {
            $normalized = [];

            foreach ($value as $key => $item) {
                $normalized[$key] = $this->normalizeComparableValue($item);
            }

            if (array_is_list($normalized)) {
                return array_values($normalized);
            }

            ksort($normalized);

            return $normalized;
        }

        if (is_string($value)) {
            return trim($value);
        }

        if (is_bool($value) || is_int($value) || is_float($value) || $value === null) {
            return $value;
        }

        return $value;
    }

    private function buildErrorMessage(string $message, Throwable $throwable): string
    {
        return sprintf('%s %s', $message, $throwable->getMessage());
    }
}
