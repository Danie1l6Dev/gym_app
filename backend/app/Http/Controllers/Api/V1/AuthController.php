<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\UpdateProfileRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        if ($lockoutResponse = $this->ensureIsNotRateLimited($request)) {
            return $lockoutResponse;
        }

        $credentials = $request->validated();
        $credentials['is_active'] = true;

        if (! Auth::attempt($credentials)) {
            RateLimiter::hit($this->throttleKey($request), $this->lockoutSeconds());

            return response()->json([
                'message' => 'No fue posible iniciar sesion con las credenciales proporcionadas.',
                'errors' => [
                    'auth' => ['Verifica tus credenciales e intenta nuevamente.'],
                ],
            ], 422);
        }

        /** @var User $user */
        $user = Auth::user();
        RateLimiter::clear($this->throttleKey($request));
        $user->load('role', 'latestMembership', 'routines.days');
        $user->tokens()->delete();

        $expiresAt = $this->tokenExpiration();
        $token = $user
            ->createToken($this->resolveTokenName($request), ['*'], $expiresAt)
            ->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesion correcto.',
            'data' => [
                'user' => UserResource::make($user),
                'token' => $token,
                'expires_at' => $expiresAt?->toIso8601String(),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return UserResource::make($user->load('role', 'latestMembership', 'routines.days'))
            ->additional(['message' => 'Perfil obtenido correctamente.'])
            ->response();
    }

    public function updateMe(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->safe()->except('profile_photo');

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo && str_starts_with($user->profile_photo, 'profile-photos/')) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            $data['profile_photo'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $user->fill($data);
        $user->save();

        return UserResource::make($user->load('role', 'latestMembership', 'routines.days'))
            ->additional(['message' => 'Perfil actualizado correctamente.'])
            ->response();
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Sesion cerrada.',
            'data' => null,
        ]);
    }

    private function ensureIsNotRateLimited(LoginRequest $request): ?JsonResponse
    {
        $throttleKey = $this->throttleKey($request);

        if (! RateLimiter::tooManyAttempts($throttleKey, $this->maxLoginAttempts())) {
            return null;
        }

        $seconds = RateLimiter::availableIn($throttleKey);

        return response()->json([
            'message' => 'Demasiados intentos de inicio de sesion. Intenta nuevamente mas tarde.',
            'errors' => [
                'auth' => ['Has superado el limite de intentos. Espera antes de volver a intentar.'],
            ],
            'meta' => [
                'retry_after' => $seconds,
                'retry_after_minutes' => (int) ceil($seconds / 60),
            ],
        ], 429);
    }

    private function throttleKey(LoginRequest $request): string
    {
        return Str::transliterate(Str::lower($request->string('email')->value())).'|'.$request->ip();
    }

    private function maxLoginAttempts(): int
    {
        return (int) config('auth.login.max_attempts', 5);
    }

    private function lockoutSeconds(): int
    {
        return (int) config('auth.login.lockout_seconds', 600);
    }

    private function tokenExpiration()
    {
        $minutes = (int) config('sanctum.expiration', 0);

        return $minutes > 0 ? now()->addMinutes($minutes) : null;
    }

    private function resolveTokenName(Request $request): string
    {
        $platform = Str::slug((string) $request->header('X-Client-Platform', 'client'));
        $version = Str::slug((string) $request->header('X-Client-Version', 'unknown'));

        return trim("{$platform}-{$version}", '-');
    }
}
