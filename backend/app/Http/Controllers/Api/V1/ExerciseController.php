<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $exercises = Exercise::query()
            ->with('muscle')
            ->when($request->filled('muscle_id'), fn ($query) => $query->where('muscle_id', $request->integer('muscle_id')))
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->toString();

                $query->where(function ($inner) use ($search): void {
                    $inner->where('name_en', 'like', "%{$search}%")
                        ->orWhere('name_es', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $exercises,
        ]);
    }

    public function show(Exercise $exercise): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $exercise->load('muscle'),
        ]);
    }
}
