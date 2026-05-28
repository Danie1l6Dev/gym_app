<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MuscleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_en' => $this->name_en,
            'name_es' => $this->name_es ?: $this->name_en,
            'display_name' => $this->display_name,
            'slug' => $this->slug,
            'exercises' => ExerciseResource::collection($this->whenLoaded('exercises')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
