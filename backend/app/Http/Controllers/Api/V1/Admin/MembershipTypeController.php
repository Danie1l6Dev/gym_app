<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreMembershipTypeRequest;
use App\Http\Requests\Api\V1\Admin\UpdateMembershipTypeRequest;
use App\Http\Resources\Api\V1\MembershipTypeResource;
use App\Models\MembershipType;
use Illuminate\Http\JsonResponse;

class MembershipTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $membershipTypes = MembershipType::query()
            ->orderByDesc('is_active')
            ->orderBy('price')
            ->get();

        return MembershipTypeResource::collection($membershipTypes)
            ->additional(['message' => 'Tipos de membresia obtenidos correctamente.'])
            ->response();
    }

    public function show(MembershipType $membershipType): JsonResponse
    {
        return MembershipTypeResource::make($membershipType)
            ->additional(['message' => 'Tipo de membresia obtenido correctamente.'])
            ->response();
    }

    public function store(StoreMembershipTypeRequest $request): JsonResponse
    {
        $membershipType = MembershipType::create($request->validated());

        return MembershipTypeResource::make($membershipType)
            ->additional(['message' => 'Tipo de membresia creado correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(
        UpdateMembershipTypeRequest $request,
        MembershipType $membershipType
    ): JsonResponse {
        $membershipType->update($request->validated());

        return MembershipTypeResource::make($membershipType)
            ->additional(['message' => 'Tipo de membresia actualizado correctamente.'])
            ->response();
    }

    public function destroy(MembershipType $membershipType): JsonResponse
    {
        $membershipType->delete();

        return response()->json([
            'data' => null,
            'message' => 'Tipo de membresia eliminado correctamente.',
        ]);
    }
}
