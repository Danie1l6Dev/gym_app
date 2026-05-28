<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\Exercises\ExerciseSyncService;
use Illuminate\Http\JsonResponse;

class ExerciseSyncController extends Controller
{
    public function __construct(
        private readonly ExerciseSyncService $service,
    ) {
    }

    public function store(): JsonResponse
    {
        $result = $this->service->sync();

        return response()->json([
            'success' => true,
            'message' => 'Sincronización completada.',
            'data' => $result,
        ]);
    }
}
