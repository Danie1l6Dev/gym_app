<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role_id' => $this->role_id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'phone' => $this->phone,
            'birth_date' => $this->birth_date,
            'gender' => $this->gender?->value ?? $this->gender,
            'height' => $this->height,
            'weight' => $this->weight,
            'profile_photo' => $this->profile_photo,
            'is_active' => $this->is_active,
            'role' => RoleResource::make($this->whenLoaded('role')),
            'latest_membership' => MembershipResource::make($this->whenLoaded('latestMembership')),
            'routines' => RoutineResource::collection($this->whenLoaded('routines')),
            'memberships' => MembershipResource::collection($this->whenLoaded('memberships')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
