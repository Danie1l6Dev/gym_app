<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\Exercises\ExerciseDbSyncService;
use Illuminate\Http\JsonResponse;

class ExerciseSyncController extends Controller
{
    public function __construct(
        private readonly ExerciseDbSyncService $service,
    ) {
    }

    public function store(): JsonResponse
    {
        $result = $this->service->sync();

        return response()->json([
            'message' => 'Sincronización completada.',
            'data' => $result,
        ]);
    }
}
