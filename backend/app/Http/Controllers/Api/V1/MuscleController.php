<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ExerciseIndexRequest;
use App\Http\Requests\Api\V1\MuscleIndexRequest;
use App\Http\Resources\Api\V1\ExerciseResource;
use App\Http\Resources\Api\V1\MuscleResource;
use App\Models\Exercise;
use App\Models\Muscle;
use Illuminate\Http\JsonResponse;

class MuscleController extends Controller
{
    public function index(MuscleIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $muscles = Muscle::query()
            ->when(! empty($filters['search'] ?? null), function ($query) use ($filters): void {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search): void {
                    $inner->where('name_en', 'like', "%{$search}%")
                        ->orWhere('name_es', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy('name_en')
            ->paginate($filters['per_page'] ?? 15);

        return MuscleResource::collection($muscles)
            ->additional(['message' => 'Musculos obtenidos correctamente.'])
            ->response();
    }

    public function show(Muscle $muscle): JsonResponse
    {
        return MuscleResource::make($muscle)
            ->additional(['message' => 'Musculo obtenido correctamente.'])
            ->response();
    }

    public function exercises(ExerciseIndexRequest $request, Muscle $muscle): JsonResponse
    {
        $filters = array_merge($request->validated(), ['muscle_id' => $muscle->id]);

        $exercises = Exercise::query()
            ->with('muscle')
            ->publicFilters($filters)
            ->searchCatalog($filters['search'] ?? null)
            ->orderedForCatalog()
            ->paginate($filters['per_page'] ?? 15);

        return ExerciseResource::collection($exercises)
            ->additional(['message' => 'Ejercicios del musculo obtenidos correctamente.'])
            ->response();
    }
}
