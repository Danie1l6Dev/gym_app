<?php

namespace App\Http\Middleware;

use App\Services\Memberships\MembershipAccountStatusService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function __construct(
        private readonly MembershipAccountStatusService $accountStatusService,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $user = $this->accountStatusService->syncUser($user);

            if ($user->is_active === false) {
                return response()->json([
                    'message' => 'Tu cuenta esta inactiva porque no tienes una membresia pagada y vigente.',
                    'errors' => [
                        'membership' => ['Renueva tu membresia con el administrador para reactivar el acceso.'],
                    ],
                ], 403);
            }
        }

        return $next($request);
    }
}
