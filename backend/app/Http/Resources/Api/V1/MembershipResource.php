<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'plan_type' => $this->plan_type,
            'plan_label' => $this->whenLoaded('type', fn () => $this->type?->name, $this->plan_type),
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'status' => $this->status,
            'price' => $this->price,
            'paid_at' => $this->paid_at,
            'notes' => $this->notes,
            'user' => UserResource::make($this->whenLoaded('user')),
            'type' => MembershipTypeResource::make($this->whenLoaded('type')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
