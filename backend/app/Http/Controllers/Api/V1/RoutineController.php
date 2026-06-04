<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\RoutineIndexRequest;
use App\Http\Requests\Api\V1\Routine\StoreRoutineRequest;
use App\Http\Requests\Api\V1\Routine\UpdateRoutineRequest;
use App\Http\Resources\Api\V1\RoutineResource;
use App\Models\Routine;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class RoutineController extends Controller
{
    public function index(RoutineIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $user = $request->user();

        $routines = Routine::query()
            ->with(['user', 'exercises.muscle'])
            ->visibleTo($user)
            ->latest()
            ->paginate($filters['per_page'] ?? 15);

        return RoutineResource::collection($routines)
            ->additional(['message' => 'Rutinas obtenidas correctamente.'])
            ->response();
    }

    public function store(StoreRoutineRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $routine = Routine::create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_predefined' => $user->role?->slug === 'admin' ? (bool) ($data['is_predefined'] ?? false) : false,
        ]);

        $this->syncExercises($routine, $data['exercises'] ?? []);

        return RoutineResource::make($routine->load(['user', 'exercises.muscle']))
            ->additional(['message' => 'Rutina creada correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Routine $routine): JsonResponse
    {
        $this->authorizeViewAccess($routine, request()->user());

        return RoutineResource::make($routine->load(['user', 'exercises.muscle']))
            ->additional(['message' => 'Rutina obtenida correctamente.'])
            ->response();
    }

    public function update(UpdateRoutineRequest $request, Routine $routine): JsonResponse
    {
        $this->authorizeManageAccess($routine, $request->user());

        $data = $request->validated();

        $updates = [];

        foreach (['name', 'description'] as $field) {
            if (array_key_exists($field, $data)) {
                $updates[$field] = $data[$field];
            }
        }

        if (array_key_exists('is_predefined', $data) && $request->user()->role?->slug === 'admin') {
            $updates['is_predefined'] = (bool) $data['is_predefined'];
        }

        $routine->update($updates);

        if (array_key_exists('exercises', $data)) {
            $this->syncExercises($routine, $data['exercises']);
        }

        return RoutineResource::make($routine->load(['user', 'exercises.muscle']))
            ->additional(['message' => 'Rutina actualizada correctamente.'])
            ->response();
    }

    public function destroy(Routine $routine): JsonResponse
    {
        $this->authorizeManageAccess($routine, request()->user());

        $routine->delete();

        return response()->json([
            'message' => 'Rutina eliminada correctamente.',
            'data' => null,
        ]);
    }

    private function authorizeViewAccess(Routine $routine, User $user): void
    {
        if ($this->canViewRoutine($routine, $user)) {
            return;
        }

        abort(403, 'No puedes acceder a esta rutina.');
    }

    private function authorizeManageAccess(Routine $routine, User $user): void
    {
        if ($this->canManageRoutine($routine, $user)) {
            return;
        }

        abort(403, 'No puedes modificar esta rutina.');
    }

    private function canViewRoutine(Routine $routine, User $user): bool
    {
        return $routine->is_predefined || $routine->user_id === $user->id;
    }

    private function canManageRoutine(Routine $routine, User $user): bool
    {
        if ($routine->is_predefined) {
            return $user->role?->slug === 'admin';
        }

        return $routine->user_id === $user->id;
    }

    private function syncExercises(Routine $routine, array $exercises): void
    {
        if ($exercises === []) {
            return;
        }

        $payload = [];

        foreach ($exercises as $exercise) {
            $payload[$exercise['exercise_id']] = [
                'position' => $exercise['position'],
                'sets' => $exercise['sets'] ?? null,
                'reps' => $exercise['reps'] ?? null,
                'rest_seconds' => $exercise['rest_seconds'] ?? null,
                'notes' => $exercise['notes'] ?? null,
            ];
        }

        $routine->exercises()->sync($payload);
    }
}
