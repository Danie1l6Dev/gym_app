<?php

namespace App\Services\Exercises;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class ExternalExerciseApiClient
{
    /**
     * @return array<int, array<string, mixed>>
     *
     * @throws RequestException
     */
    public function fetchMuscles(): array
    {
        return $this->fetchItems((string) config('services.exercise_db.muscles_path', '/api/v1/muscles'));
    }

    /**
     * @return array<int, array<string, mixed>>
     *
     * @throws RequestException
     */
    public function fetchBodyParts(): array
    {
        return $this->fetchItems((string) config('services.exercise_db.bodyparts_path', '/api/v1/bodyparts'));
    }

    /**
     * @return array{items: array<int, array<string, mixed>>, meta: array<string, mixed>}
     *
     * @throws RequestException
     */
    public function fetchExercises(array $query = []): array
    {
        return $this->fetchPage((string) config('services.exercise_db.exercises_path', '/api/v1/exercises'), $query);
    }

    /**
     * @return array<int, array<string, mixed>>
     *
     * @throws RequestException
     */
    private function fetchItems(string $path, array $query = []): array
    {
        return $this->fetchPage($path, $query)['items'];
    }

    /**
     * @return array{items: array<int, array<string, mixed>>, meta: array<string, mixed>}
     *
     * @throws RequestException
     */
    private function fetchPage(string $path, array $query = []): array
    {
        $url = $this->resolveUrl($path);
        $timeout = (int) config('services.exercise_db.timeout', config('services.exercise_api.timeout', 30));
        $payload = $this->requestPayload($url, $query, $timeout);
        $items = [];
        $meta = [];

        if (is_array($payload)) {
            if (isset($payload['meta']) && is_array($payload['meta'])) {
                $meta = $payload['meta'];
            }

            foreach (['data', 'results', 'items'] as $key) {
                if (isset($payload[$key]) && is_array($payload[$key])) {
                    $items = array_values($payload[$key]);
                    break;
                }
            }

            if ($items === [] && array_is_list($payload)) {
                $items = array_values($payload);
            }
        }

        return [
            'items' => $items,
            'meta' => $meta,
        ];
    }

    private function requestPayload(string $url, array $query, int $timeout): array
    {
        $lastThrowable = null;
        $attempts = 3;

        for ($attempt = 1; $attempt <= $attempts; $attempt++) {
            try {
                return $this->requestPayloadWithCurl($url, $query, $timeout);
            } catch (Throwable $throwable) {
                $lastThrowable = $throwable;

                if (! $this->shouldRetryTransportFailure($throwable) || $attempt === $attempts) {
                    break;
                }

                usleep((int) (pow(2, $attempt - 1) * 1000000));
            }
        }

        throw $lastThrowable ?? new RuntimeException('No se pudo consultar ExerciseDB.');
    }

    private function requestPayloadWithCurl(string $url, array $query, int $timeout): array
    {
        $queryString = http_build_query($query, '', '&', PHP_QUERY_RFC3986);
        $fullUrl = $queryString !== '' ? $url . '?' . $queryString : $url;

        $headers = [
            'Accept: application/json',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        ];

        $command = 'curl.exe -s';

        foreach ($headers as $header) {
            $command .= ' -H ' . escapeshellarg($header);
        }

        $command .= ' ' . escapeshellarg($fullUrl);

        $rawBody = trim((string) shell_exec($command));

        if ($rawBody === '') {
            throw new RuntimeException('ExerciseDB devolvio una respuesta vacia.');
        }

        $payload = json_decode($rawBody, true);

        if (! is_array($payload)) {
            throw new RuntimeException('ExerciseDB devolvio una respuesta invalida: ' . $rawBody);
        }

        return $payload;
    }

    private function shouldRetryTransportFailure(Throwable $throwable): bool
    {
        $message = $throwable->getMessage();

        return str_contains($message, '1015')
            || str_contains($message, '429')
            || str_contains($message, 'error code: 1015')
            || str_contains($message, 'respuesta invalida')
            || str_contains($message, 'Invalid');
    }

    private function resolveUrl(string $path): string
    {
        $baseUrl = (string) (config('services.exercise_db.base_url') ?: config('services.exercise_api.url'));

        if ($baseUrl === '') {
            throw new RuntimeException('No se configuro la URL de ExerciseDB.');
        }

        $baseUrl = rtrim($baseUrl, '/');
        $path = '/' . ltrim($path, '/');

        if (Str::endsWith($baseUrl, $path)) {
            return $baseUrl;
        }

        return $baseUrl . $path;
    }
}
