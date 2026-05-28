<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ExerciseIndexRequest;
use App\Http\Resources\Api\V1\ExerciseResource;
use App\Models\Exercise;
use Illuminate\Http\JsonResponse;

class ExerciseController extends Controller
{
    public function index(ExerciseIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $exercises = Exercise::query()
            ->with('muscle')
            ->when(isset($filters['muscle_id']), fn ($query) => $query->where('muscle_id', $filters['muscle_id']))
            ->when(isset($filters['search']), function ($query) use ($filters): void {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search): void {
                    $inner->where('name_en', 'like', "%{$search}%")
                        ->orWhere('name_es', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($filters['per_page'] ?? 15);

        return ExerciseResource::collection($exercises)
            ->additional(['message' => 'Ejercicios obtenidos correctamente.'])
            ->response();
    }

    public function show(Exercise $exercise): JsonResponse
    {
        return ExerciseResource::make($exercise->load('muscle'))
            ->additional(['message' => 'Ejercicio obtenido correctamente.'])
            ->response();
    }
}
