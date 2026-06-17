<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoutineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'description' => $this->description,
            'is_predefined' => $this->is_predefined,
            'user' => UserResource::make($this->whenLoaded('user')),
            'days' => DayResource::collection($this->whenLoaded('days')),
            'exercises' => ExerciseResource::collection($this->whenLoaded('exercises')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
