<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Routine\StoreRoutineRequest;
use App\Http\Requests\Api\V1\Routine\UpdateRoutineRequest;
use App\Models\Routine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoutineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
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
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $routines,
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Rutina creada correctamente.',
            'data' => $routine->load(['user', 'exercises.muscle']),
        ], 201);
    }

    public function show(Routine $routine): JsonResponse
    {
        $this->authorizeAccess($routine);

        return response()->json([
            'success' => true,
            'data' => $routine->load(['user', 'exercises.muscle']),
        ]);
    }

    public function update(UpdateRoutineRequest $request, Routine $routine): JsonResponse
    {
        $this->authorizeAccess($routine);

        $data = $request->validated();

        $routine->update(array_filter([
            'name' => $data['name'] ?? null,
            'description' => array_key_exists('description', $data) ? $data['description'] : null,
            'is_predefined' => $data['is_predefined'] ?? null,
        ], static fn ($value) => $value !== null));

        if (array_key_exists('exercises', $data)) {
            $this->syncExercises($routine, $data['exercises']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Rutina actualizada correctamente.',
            'data' => $routine->load(['user', 'exercises.muscle']),
        ]);
    }

    public function destroy(Routine $routine): JsonResponse
    {
        $this->authorizeAccess($routine);

        $routine->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rutina eliminada correctamente.',
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
