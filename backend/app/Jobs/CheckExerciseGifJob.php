<?php

namespace App\Jobs;

use App\Models\Exercise;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class CheckExerciseGifJob implements ShouldQueue
{
    use Dispatchable;
    use Queueable;

    public int $timeout = 30;

    public function __construct(
        public readonly int $exerciseId,
    ) {}

    public function handle(): void
    {
        $exercise = Exercise::query()->find($this->exerciseId);

        if ($exercise === null) {
            return;
        }

        $gifUrl = trim((string) $exercise->gif_url);

        if ($gifUrl === '') {
            $exercise->forceFill([
                'gif_available' => false,
                'gif_checked_at' => now(),
            ])->save();

            return;
        }

        try {
            $response = $this->probe($gifUrl, 'head');

            if (! $this->isAvailableStatus($response->status())) {
                $response = $this->probe($gifUrl, 'get');
            }

            $exercise->forceFill([
                'gif_available' => $this->isAvailableStatus($response->status()),
                'gif_checked_at' => now(),
            ])->save();
        } catch (Throwable $throwable) {
            Log::warning('Exercise GIF availability check failed.', [
                'exercise_id' => $exercise->id,
                'external_id' => $exercise->external_id,
                'gif_url' => $gifUrl,
                'exception' => $throwable,
            ]);

            $exercise->forceFill([
                'gif_checked_at' => now(),
            ])->save();
        }
    }

    private function probe(string $gifUrl, string $method)
    {
        $request = Http::timeout(20)
            ->retry(2, 750)
            ->withOptions([
                'verify' => (bool) config('services.exercise_db.verify_ssl', false),
            ])
            ->withHeaders([
                'Accept' => 'image/gif,image/*,*/*',
                'Range' => 'bytes=0-0',
                'User-Agent' => 'Mozilla/5.0 GymApp/1.0',
            ]);

        return $method === 'head'
            ? $request->head($gifUrl)
            : $request->get($gifUrl);
    }

    private function isAvailableStatus(int $status): bool
    {
        return $status >= 200 && $status < 400;
    }

}
