<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WorkoutCheckIn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class WeeklyProgressController extends Controller
{
    private const WEEK_DAYS = [
        ['slug' => 'lunes', 'label' => 'Lunes'],
        ['slug' => 'martes', 'label' => 'Martes'],
        ['slug' => 'miercoles', 'label' => 'Miercoles'],
        ['slug' => 'jueves', 'label' => 'Jueves'],
        ['slug' => 'viernes', 'label' => 'Viernes'],
        ['slug' => 'sabado', 'label' => 'Sabado'],
        ['slug' => 'domingo', 'label' => 'Domingo'],
    ];

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->buildProgress($request->user()),
            'message' => 'Progreso semanal obtenido correctamente.',
        ]);
    }

    public function showForUser(User $user): JsonResponse
    {
        return response()->json([
            'data' => $this->buildProgress($user),
            'message' => 'Progreso semanal del usuario obtenido correctamente.',
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'completed' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $date = Carbon::parse($data['date'])->startOfDay();
        $weekStart = now()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $weekEnd = now()->endOfWeek(Carbon::SUNDAY)->startOfDay();

        if ($date->lt($weekStart) || $date->gt($weekEnd)) {
            throw ValidationException::withMessages([
                'date' => 'Solo puedes actualizar el progreso de la semana actual.',
            ]);
        }

        if ($request->boolean('completed')) {
            WorkoutCheckIn::query()->updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'workout_date' => $date->toDateString(),
                ],
                [
                    'completed_at' => now(),
                    'notes' => $data['notes'] ?? null,
                ],
            );
        } else {
            WorkoutCheckIn::query()
                ->where('user_id', $request->user()->id)
                ->whereDate('workout_date', $date->toDateString())
                ->delete();
        }

        return response()->json([
            'data' => $this->buildProgress($request->user()),
            'message' => 'Progreso semanal actualizado correctamente.',
        ]);
    }

    private function buildProgress(User $user): array
    {
        $weekStart = now()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $weekEnd = now()->endOfWeek(Carbon::SUNDAY)->startOfDay();
        $today = today();

        $user->loadMissing(['routines.days']);

        $scheduledByDay = [];

        foreach ($user->routines->where('is_predefined', false) as $routine) {
            foreach ($routine->days as $day) {
                $scheduledByDay[$day->slug] ??= [];
                $scheduledByDay[$day->slug][] = [
                    'id' => $routine->id,
                    'name' => $routine->name,
                ];
            }
        }

        $checkIns = WorkoutCheckIn::query()
            ->where('user_id', $user->id)
            ->whereBetween('workout_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->get()
            ->keyBy(fn (WorkoutCheckIn $checkIn): string => $checkIn->workout_date->toDateString());

        $days = [];
        $targetDays = 0;
        $completedTargetDays = 0;
        $completedDays = 0;

        foreach (self::WEEK_DAYS as $index => $dayConfig) {
            $date = $weekStart->copy()->addDays($index);
            $dateKey = $date->toDateString();
            $routines = $scheduledByDay[$dayConfig['slug']] ?? [];
            $isScheduled = count($routines) > 0;
            $completed = $checkIns->has($dateKey);

            if ($isScheduled) {
                $targetDays++;
            }

            if ($completed) {
                $completedDays++;
            }

            if ($isScheduled && $completed) {
                $completedTargetDays++;
            }

            $days[] = [
                'date' => $dateKey,
                'slug' => $dayConfig['slug'],
                'label' => $dayConfig['label'],
                'is_today' => $date->isSameDay($today),
                'is_past' => $date->lt($today),
                'is_scheduled' => $isScheduled,
                'completed' => $completed,
                'routines' => $routines,
            ];
        }

        $percentage = $targetDays > 0
            ? (int) round(min($completedTargetDays / $targetDays, 1) * 100)
            : 0;

        $nextPendingDay = collect($days)
            ->first(fn (array $day): bool => $day['is_scheduled'] && ! $day['completed'] && $day['date'] >= $today->toDateString())
            ?? collect($days)->first(fn (array $day): bool => $day['is_scheduled'] && ! $day['completed']);

        return [
            'week_start' => $weekStart->toDateString(),
            'week_end' => $weekEnd->toDateString(),
            'target_days' => $targetDays,
            'completed_days' => $completedDays,
            'completed_target_days' => $completedTargetDays,
            'percentage' => $percentage,
            'status_label' => $this->resolveStatusLabel($percentage, $targetDays),
            'next_pending_day' => $nextPendingDay,
            'days' => $days,
        ];
    }

    private function resolveStatusLabel(int $percentage, int $targetDays): string
    {
        if ($targetDays === 0) {
            return 'Sin rutina semanal';
        }

        if ($percentage >= 100) {
            return 'Semana completada';
        }

        if ($percentage >= 60) {
            return 'Buen ritmo';
        }

        if ($percentage > 0) {
            return 'En progreso';
        }

        return 'Pendiente por iniciar';
    }
}
