<?php

namespace App\Console\Commands;

use App\Jobs\TranslateExerciseJob;
use App\Jobs\TranslateMuscleJob;
use App\Models\Exercise;
use App\Models\Muscle;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

class DispatchPendingTranslationsCommand extends Command
{
    protected $signature = 'translations:dispatch-pending
        {--force : Reenviar tambien traducciones existentes}
        {--only=all : Opciones: all, muscles, exercises}';

    protected $description = 'Encola traducciones pendientes de musculos e instrucciones de ejercicios';

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $only = (string) $this->option('only');
        $muscles = 0;
        $exercises = 0;

        if (! in_array($only, ['all', 'muscles', 'exercises'], true)) {
            $this->error('La opcion --only debe ser all, muscles o exercises.');

            return self::FAILURE;
        }

        if ($only !== 'exercises') {
            Muscle::query()
                ->when(! $force, function ($query): void {
                    $query->where(function ($inner): void {
                        $inner->whereNull('name_es')
                            ->orWhere('name_es', '')
                            ->orWhereColumn('name_es', 'name_en');
                    });
                })
                ->chunkById(100, function ($items) use (&$muscles, $force): void {
                    $items->each(function (Muscle $muscle) use (&$muscles, $force): void {
                        TranslateMuscleJob::dispatch($muscle->id, $force);
                        $muscles++;
                    });
                });
        }

        if ($only !== 'muscles') {
            Exercise::query()
                ->whereNotNull('instructions_original')
                ->chunkById(100, function ($items) use (&$exercises, $force): void {
                    $items
                        ->filter(fn (Exercise $exercise) => $this->hasInstructionList($exercise->instructions_original))
                        ->filter(fn (Exercise $exercise) => $force || ! $this->hasInstructionList($exercise->instructions_es))
                        ->each(function (Exercise $exercise) use (&$exercises, $force): void {
                            TranslateExerciseJob::dispatch($exercise->id, $force);
                            $exercises++;
                        });
                });
        }

        $this->info(sprintf('Jobs de musculos encolados: %d', $muscles));
        $this->info(sprintf('Jobs de ejercicios encolados: %d', $exercises));

        return self::SUCCESS;
    }

    private function hasInstructionList(mixed $value): bool
    {
        if (is_string($value)) {
            return trim($value) !== '';
        }

        if (! is_array($value)) {
            return false;
        }

        return Collection::make($value)
            ->flatten()
            ->contains(fn ($item) => (is_string($item) || is_numeric($item)) && trim((string) $item) !== '');
    }
}
