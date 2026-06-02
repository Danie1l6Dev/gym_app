<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Error de validacion',
                'errors' => [
                    'auth' => ['Las credenciales no son validas.'],
                ],
            ], 422);
        }

        /** @var User $user */
        $user = Auth::user();
        $user->load('role', 'latestMembership');
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión correcto.',
            'data' => [
                'user' => UserResource::make($user),
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return UserResource::make($user->load('role', 'latestMembership'))
            ->additional(['message' => 'Perfil obtenido correctamente.'])
            ->response();
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Sesión cerrada.',
            'data' => null,
        ]);
    }
}
