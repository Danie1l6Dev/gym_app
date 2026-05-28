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
            ->publicFilters($filters)
            ->searchCatalog($filters['search'] ?? null)
            ->orderedForCatalog()
            ->paginate($filters['per_page'] ?? 15);

        return ExerciseResource::collection($exercises)
            ->additional(['message' => 'Ejercicios obtenidos correctamente.'])
            ->response();
    }

    public function search(ExerciseIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $term = $filters['search'] ?? $filters['name'] ?? $filters['nombre'] ?? null;

        $exercises = Exercise::query()
            ->with('muscle')
            ->publicFilters($filters)
            ->searchCatalog($term)
            ->orderedForCatalog()
            ->paginate($filters['per_page'] ?? 15);

        return ExerciseResource::collection($exercises)
            ->additional(['message' => 'Busqueda de ejercicios obtenida correctamente.'])
            ->response();
    }

    public function show(Exercise $exercise): JsonResponse
    {
        return ExerciseResource::make($exercise->load('muscle'))
            ->additional(['message' => 'Ejercicio obtenido correctamente.'])
            ->response();
    }
}
