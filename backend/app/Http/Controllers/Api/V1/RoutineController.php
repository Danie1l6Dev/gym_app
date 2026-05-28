<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\RoutineIndexRequest;
use App\Http\Requests\Api\V1\Routine\StoreRoutineRequest;
use App\Http\Requests\Api\V1\Routine\UpdateRoutineRequest;
use App\Http\Resources\Api\V1\RoutineResource;
use App\Models\Routine;
use Illuminate\Http\JsonResponse;

class RoutineController extends Controller
{
    public function index(RoutineIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $user = $request->user();

        $routines = Routine::query()
            ->with(['user', 'exercises.muscle'])
            ->when(
                ! $user->role || $user->role->slug !== 'admin',
                fn ($query) => $query->where(function ($inner) use ($user): void {
                    $inner->where('user_id', $user->id)
                        ->orWhere('is_predefined', true);
                })
            )
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
        $this->authorizeAccess($routine);

        return RoutineResource::make($routine->load(['user', 'exercises.muscle']))
            ->additional(['message' => 'Rutina obtenida correctamente.'])
            ->response();
    }

    public function update(UpdateRoutineRequest $request, Routine $routine): JsonResponse
    {
        $this->authorizeAccess($routine);

        $data = $request->validated();

        $updates = [];

        foreach (['name', 'description', 'is_predefined'] as $field) {
            if (array_key_exists($field, $data)) {
                $updates[$field] = $data[$field];
            }
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
        $this->authorizeAccess($routine);

        $routine->delete();

        return response()->json([
            'message' => 'Rutina eliminada correctamente.',
            'data' => null,
        ]);
    }

    private function authorizeAccess(Routine $routine): void
    {
        $user = request()->user();

        if ($user->role?->slug === 'admin') {
            return;
        }

        abort_unless($routine->user_id === $user->id || $routine->is_predefined, 403, 'No puedes acceder a esta rutina.');
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
