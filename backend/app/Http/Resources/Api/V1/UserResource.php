<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
            'avatarUrl' => $this->resolveAvatarUrl($request),
            'is_active' => $this->is_active,
            'role' => RoleResource::make($this->whenLoaded('role')),
            'latest_membership' => MembershipResource::make($this->whenLoaded('latestMembership')),
            'routines' => RoutineResource::collection($this->whenLoaded('routines')),
            'memberships' => MembershipResource::collection($this->whenLoaded('memberships')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function resolveAvatarUrl(Request $request): ?string
    {
        if (! $this->profile_photo) {
            return null;
        }

        // Si ya es una URL absoluta, retornarla tal cual
        if (str_starts_with($this->profile_photo, 'http://') || str_starts_with($this->profile_photo, 'https://')) {
            return $this->profile_photo;
        }

        // Retornar la ruta relativa con timestamp para invalidar caché
        $path = '/storage/' . $this->profile_photo;

        if ($this->updated_at) {
            $path .= '?t=' . $this->updated_at->getTimestamp();
        }

        return $path;
    }
}
