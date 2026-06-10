<?php

namespace App\Jobs;

use App\Models\Exercise;
use App\Services\Translation\LibreTranslateClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Throwable;

class TranslateExerciseJob implements ShouldQueue
{
    use Dispatchable;
    use Queueable;

    public int $timeout = 120;

    public function __construct(
        public readonly int $exerciseId,
        public readonly bool $force = false,
    ) {}

    public function handle(LibreTranslateClient $translator): void
    {
        $exercise = Exercise::query()->find($this->exerciseId);

        if ($exercise === null || (! $this->force && $this->hasInstructionsTranslation($exercise->instructions_es))) {
            return;
        }

        $instructions = $this->normalizeInstructions($exercise->instructions_original);

        if ($instructions === []) {
            return;
        }

        try {
            $translatedInstructions = $translator->translateMany($instructions, 'en', 'es');

            $exercise->forceFill([
                'instructions_es' => $translatedInstructions,
                'description_es' => implode(PHP_EOL, $translatedInstructions),
            ])->save();
        } catch (Throwable $throwable) {
            Log::error('Exercise instruction translation failed.', [
                'exercise_id' => $exercise->id,
                'external_id' => $exercise->external_id,
                'exception' => $throwable,
            ]);
        }
    }

    private function hasInstructionsTranslation(mixed $value): bool
    {
        return $this->normalizeInstructions($value) !== [];
    }

    /**
     * @return array<int, string>
     */
    private function normalizeInstructions(mixed $value): array
    {
        if (is_string($value)) {
            $trimmed = trim($value);

            return $trimmed !== '' ? [$trimmed] : [];
        }

        if (! is_array($value)) {
            return [];
        }

        return Collection::make($value)
            ->flatten()
            ->filter(fn ($item) => is_string($item) || is_numeric($item))
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->values()
            ->all();
    }
}
