<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\MembershipIndexRequest;
use App\Http\Requests\Api\V1\Admin\StoreMembershipRequest;
use App\Http\Requests\Api\V1\Admin\UpdateMembershipRequest;
use App\Http\Resources\Api\V1\MembershipResource;
use App\Models\Membership;
use Illuminate\Http\JsonResponse;

class MembershipController extends Controller
{
    public function index(MembershipIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $memberships = Membership::query()
            ->with(['user', 'type'])
            ->latest()
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
            ->whereBetween('ends_at', [now()->toDateString(), now()->addDays($days)->toDateString()])
            ->orderBy('ends_at')
            ->paginate($filters['per_page'] ?? 15);

        return MembershipResource::collection($memberships)
            ->additional(['message' => 'Membresías próximas a vencer obtenidas correctamente.'])
            ->response();
    }

    public function store(StoreMembershipRequest $request): JsonResponse
    {
        $membership = Membership::create($request->validated());

        return MembershipResource::make($membership->load(['user', 'type']))
            ->additional(['message' => 'Membresía creada correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateMembershipRequest $request, Membership $membership): JsonResponse
    {
        $membership->update($request->validated());

        return MembershipResource::make($membership->load(['user', 'type']))
            ->additional(['message' => 'Membresía actualizada correctamente.'])
            ->response();
    }
}
