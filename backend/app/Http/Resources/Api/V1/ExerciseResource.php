<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'muscle_id' => $this->muscle_id,
            'source' => $this->source,
            'external_id' => $this->external_id,
            'name_en' => $this->name_en,
            'name_es' => $this->name_es,
            'display_name' => $this->display_name,
            'description_en' => $this->description_en,
            'description_es' => $this->description_es,
            'display_description' => $this->display_description,
            'gif_url' => $this->gif_url,
            'muscle' => MuscleResource::make($this->whenLoaded('muscle')),
            'pivot' => $this->whenPivotLoaded('routine_exercises', function () {
                return [
                    'position' => $this->pivot->position,
                    'sets' => $this->pivot->sets,
                    'reps' => $this->pivot->reps,
                    'rest_seconds' => $this->pivot->rest_seconds,
                    'notes' => $this->pivot->notes,
                ];
            }),
            'synced_at' => $this->synced_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
