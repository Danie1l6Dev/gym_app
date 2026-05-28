<?php

namespace App\Console\Commands;

use App\Services\Exercises\ExerciseDbSyncService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncExercisesCommand extends Command
{
    protected $signature = 'exercises:sync';

    protected $description = 'Sincroniza ejercicios desde ExerciseDB V1 hacia la base local';

    public function __construct(
        private readonly ExerciseDbSyncService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        try {
            $result = $this->service->sync();

            $this->info('Sincronización completada.');
            $this->line(sprintf('Creados: %d', $result['created'] ?? 0));
            $this->line(sprintf('Actualizados: %d', $result['updated'] ?? 0));
            $this->line(sprintf('Omitidos: %d', $result['omitted'] ?? 0));

            foreach (($result['errors'] ?? []) as $error) {
                $this->warn($error);
            }

            if (($result['errors'] ?? []) !== []) {
                $this->warn('La sincronización terminó con advertencias.');
            }

            return self::SUCCESS;
        } catch (Throwable $throwable) {
            Log::error('Exercise sync command failed.', [
                'exception' => $throwable,
            ]);

            $this->error('No se pudo completar la sincronización.');
            $this->line($throwable->getMessage());

            return self::FAILURE;
        }
    }
}
