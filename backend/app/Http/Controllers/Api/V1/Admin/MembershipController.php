<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreMembershipRequest;
use App\Http\Requests\Api\V1\Admin\UpdateMembershipRequest;
use App\Models\Membership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $memberships = Membership::query()
            ->with('user')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $memberships,
        ]);
    }

    public function upcoming(Request $request): JsonResponse
    {
        $days = $request->integer('days', 30);

        $memberships = Membership::query()
            ->with('user')
            ->where('status', 'active')
            ->whereBetween('ends_at', [now()->toDateString(), now()->addDays($days)->toDateString()])
            ->orderBy('ends_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $memberships,
        ]);
    }

    public function store(StoreMembershipRequest $request): JsonResponse
    {
        $membership = Membership::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Membresía creada correctamente.',
            'data' => $membership->load('user'),
        ], 201);
    }

    public function update(UpdateMembershipRequest $request, Membership $membership): JsonResponse
    {
        $membership->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Membresía actualizada correctamente.',
            'data' => $membership->load('user'),
        ]);
    }
}
