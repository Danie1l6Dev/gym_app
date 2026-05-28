<?php

use App\Http\Controllers\Api\V1\Admin\ExerciseSyncController;
use App\Http\Controllers\Api\V1\Admin\MembershipController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ExerciseController;
use App\Http\Controllers\Api\V1\MuscleController;
use App\Http\Controllers\Api\V1\RoutineController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('muscles', [MuscleController::class, 'index']);
        Route::get('muscles/{muscle}', [MuscleController::class, 'show']);

        Route::get('exercises', [ExerciseController::class, 'index']);
        Route::get('exercises/{exercise}', [ExerciseController::class, 'show']);

        Route::get('routines', [RoutineController::class, 'index']);
        Route::post('routines', [RoutineController::class, 'store']);
        Route::get('routines/{routine}', [RoutineController::class, 'show']);
        Route::put('routines/{routine}', [RoutineController::class, 'update']);
        Route::delete('routines/{routine}', [RoutineController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function (): void {
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::get('users/{user}', [UserController::class, 'show']);
        Route::put('users/{user}', [UserController::class, 'update']);

        Route::get('memberships', [MembershipController::class, 'index']);
        Route::post('memberships', [MembershipController::class, 'store']);
        Route::get('memberships/upcoming', [MembershipController::class, 'upcoming']);
        Route::put('memberships/{membership}', [MembershipController::class, 'update']);

        Route::post('exercises/sync', [ExerciseSyncController::class, 'store']);
    });
});
