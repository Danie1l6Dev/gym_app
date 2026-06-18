<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\MembershipIndexRequest;
use App\Http\Requests\Api\V1\Admin\StoreMembershipRequest;
use App\Http\Requests\Api\V1\Admin\UpdateMembershipRequest;
use App\Http\Resources\Api\V1\MembershipResource;
use App\Models\Membership;
use App\Services\Memberships\MembershipAccountStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MembershipController extends Controller
{
    public function __construct(
        private readonly MembershipAccountStatusService $accountStatusService,
    ) {
    }

    public function index(MembershipIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $memberships = Membership::query()
            ->with(['user', 'type'])
            ->when(isset($filters['search']) && $filters['search'] !== '', function ($query) use ($filters): void {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search): void {
                    $inner->where('plan_type', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('type', function ($typeQuery) use ($search): void {
                            $typeQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%");
                        })
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('username', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByRaw(
                "CASE WHEN status = 'active' AND ends_at >= ? THEN 0 ELSE 1 END",
                [now()->toDateString()]
            )
            ->orderBy('ends_at')
            ->orderBy('starts_at')
            ->paginate($filters['per_page'] ?? 15);

        return MembershipResource::collection($memberships)
            ->additional(['message' => 'Membresías obtenidas correctamente.'])
            ->response();
    }

    public function upcoming(MembershipIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $days = (int) ($filters['days'] ?? 30);

        $memberships = Membership::query()
            ->with(['user', 'type'])
            ->where('status', 'active')
            ->whereNotExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('memberships as newer_memberships')
                    ->whereColumn('newer_memberships.user_id', 'memberships.user_id')
                    ->where('newer_memberships.status', 'active')
                    ->where(function ($inner): void {
                        $inner->whereColumn('newer_memberships.ends_at', '>', 'memberships.ends_at')
                            ->orWhere(function ($sameEndDate): void {
                                $sameEndDate
                                    ->whereColumn('newer_memberships.ends_at', 'memberships.ends_at')
                                    ->whereColumn('newer_memberships.id', '>', 'memberships.id');
                            });
                    });
            })
            ->whereBetween('ends_at', [now()->toDateString(), now()->addDays($days)->toDateString()])
            ->orderBy('ends_at')
            ->paginate($filters['per_page'] ?? 15);

        return MembershipResource::collection($memberships)
            ->additional(['message' => 'Membresías próximas a vencer obtenidas correctamente.'])
            ->response();
    }

    public function store(StoreMembershipRequest $request): JsonResponse
    {
        $membership = DB::transaction(function () use ($request): Membership {
            $membership = Membership::create($this->normalizePaidMembershipData($request->validated()));
            $this->closePreviousActiveMemberships($membership);

            return $membership;
        });

        $this->accountStatusService->reactivateFromPaidMembership($membership);

        return MembershipResource::make($membership->load(['user', 'type']))
            ->additional(['message' => 'Membresía creada correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateMembershipRequest $request, Membership $membership): JsonResponse
    {
        DB::transaction(function () use ($request, $membership): void {
            $membership->update($this->normalizePaidMembershipData($request->validated()));
            $this->closePreviousActiveMemberships($membership);
        });

        $this->accountStatusService->reactivateFromPaidMembership($membership);

        return MembershipResource::make($membership->load(['user', 'type']))
            ->additional(['message' => 'Membresía actualizada correctamente.'])
            ->response();
    }

    private function normalizePaidMembershipData(array $data): array
    {
        if (($data['status'] ?? 'active') === 'active' && ! array_key_exists('paid_at', $data)) {
            $data['paid_at'] = now();
        }

        return $data;
    }

    private function closePreviousActiveMemberships(Membership $membership): void
    {
        if ($membership->status !== 'active' || $membership->paid_at === null) {
            return;
        }

        Membership::query()
            ->where('user_id', $membership->user_id)
            ->whereKeyNot($membership->id)
            ->where('status', 'active')
            ->update(['status' => 'expired']);
    }
}
