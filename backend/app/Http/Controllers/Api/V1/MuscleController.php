<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Muscle;
use Illuminate\Http\JsonResponse;

class MuscleController extends Controller
{
    public function index(): JsonResponse
    {
        $muscles = Muscle::query()
            ->orderBy('name_en')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $muscles,
        ]);
    }

    public function show(Muscle $muscle): JsonResponse
    {
        $muscle->load(['exercises' => fn ($query) => $query->orderBy('name_en')]);

        return response()->json([
            'success' => true,
            'data' => $muscle,
        ]);
    }
}
