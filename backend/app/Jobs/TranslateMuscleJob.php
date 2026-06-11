<?php

namespace App\Jobs;

use App\Models\Muscle;
use App\Services\Translation\LibreTranslateClient;
use App\Support\MuscleNameDictionary;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class TranslateMuscleJob implements ShouldQueue
{
    use Dispatchable;
    use Queueable;

    public int $timeout = 120;

    public function __construct(
        public readonly int $muscleId,
        public readonly bool $force = false,
    ) {}

    public function handle(LibreTranslateClient $translator): void
    {
        $muscle = Muscle::query()->find($this->muscleId);

        if ($muscle === null || trim((string) $muscle->name_en) === '') {
            return;
        }

        if (! $this->force && $this->hasSpanishName($muscle)) {
            return;
        }

        try {
            $translatedName = MuscleNameDictionary::translate($muscle->name_en)
                ?? trim($translator->translate($muscle->name_en, 'en', 'es'));

            if ($translatedName === '') {
                return;
            }

            $muscle->forceFill([
                'name_es' => $translatedName,
            ])->save();
        } catch (Throwable $throwable) {
            Log::error('Muscle name translation failed.', [
                'muscle_id' => $muscle->id,
                'name_en' => $muscle->name_en,
                'exception' => $throwable,
            ]);

            throw $throwable;
        }
    }

    private function hasSpanishName(Muscle $muscle): bool
    {
        $nameEs = trim((string) $muscle->name_es);

        return $nameEs !== '' && $nameEs !== trim((string) $muscle->name_en);
    }
}
