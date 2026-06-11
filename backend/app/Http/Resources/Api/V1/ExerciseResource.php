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
            'name_en' => $this->name_en ?: $this->name_original,
            'name_original' => $this->name_original,
            'name_es' => $this->name_es ?: $this->name_original ?: $this->name_en,
            'display_name' => $this->display_name,
            'body_part' => $this->body_part,
            'target_muscle' => $this->target_muscle,
            'secondary_muscles' => $this->secondary_muscles,
            'equipment' => $this->equipment,
            'gif_url' => $this->gif_url,
            'description_en' => $this->description_en,
            'description_es' => $this->description_es ?: $this->description_en,
            'instructions_original' => $this->instructions_original,
            'instructions_es' => $this->instructions_es ?: $this->instructions_original,
            'has_instructions_es' => $this->hasInstructionTranslation($this->instructions_es),
            'display_description' => $this->display_description,
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

    private function hasInstructionTranslation(mixed $instructions): bool
    {
        if (is_string($instructions)) {
            return trim($instructions) !== '';
        }

        if (! is_array($instructions)) {
            return false;
        }

        foreach ($instructions as $instruction) {
            if (is_string($instruction) && trim($instruction) !== '') {
                return true;
            }
        }

        return false;
    }
}
