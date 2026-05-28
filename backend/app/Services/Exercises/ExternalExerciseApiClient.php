<?php

namespace App\Services\Exercises;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class ExternalExerciseApiClient
{
    /**
     * @return array<int, array<string, mixed>>
     *
     * @throws RequestException
     */
    public function fetchExercises(): array
    {
        $url = $this->resolveUrl();
        $timeout = (int) config('services.exercise_db.timeout', config('services.exercise_api.timeout', 30));

        $request = Http::timeout($timeout);

        $apiKey = config('services.exercise_db.key') ?? config('services.exercise_api.key');

        if ($apiKey) {
            $request = $request->withToken($apiKey);
        }

        $response = $request->acceptJson()->get($url);
        $response->throw();

        $payload = $response->json();

        if (is_array($payload)) {
            foreach (['data', 'results', 'items'] as $key) {
                if (isset($payload[$key]) && is_array($payload[$key])) {
                    return array_values($payload[$key]);
                }
            }

            if (array_is_list($payload)) {
                return array_values($payload);
            }
        }

        return [];
    }

    private function resolveUrl(): string
    {
        $baseUrl = (string) (config('services.exercise_db.base_url') ?? config('services.exercise_api.url'));

        if ($baseUrl === '') {
            throw new RuntimeException('No se configuró la URL de ExerciseDB.');
        }

        $baseUrl = rtrim($baseUrl, '/');
        $path = (string) config('services.exercise_db.exercises_path', '/api/v1/exercises');

        if (Str::endsWith($baseUrl, $path)) {
            return $baseUrl;
        }

        return $baseUrl . '/' . ltrim($path, '/');
    }
}
