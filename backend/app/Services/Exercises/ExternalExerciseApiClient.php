<?php

namespace App\Services\Exercises;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class ExternalExerciseApiClient
{
    public function fetch(): array
    {
        $url = config('services.exercise_api.url');

        if (! $url) {
            throw new RuntimeException('No se configuró EXERCISE_API_URL.');
        }

        $request = Http::timeout((int) config('services.exercise_api.timeout', 30));

        if ($apiKey = config('services.exercise_api.key')) {
            $request = $request->withToken($apiKey);
        }

        $response = $request->acceptJson()->get($url);

        $response->throw();

        $payload = $response->json();

        if (isset($payload['data']) && is_array($payload['data'])) {
            return $payload['data'];
        }

        return is_array($payload) ? $payload : [];
    }
}
