<?php

namespace App\Http\Requests\Api\V1\Routine;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoutineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'is_predefined' => ['sometimes', 'boolean'],
            'exercises' => ['sometimes', 'array'],
            'exercises.*.exercise_id' => ['required_with:exercises', 'integer', 'exists:exercises,id'],
            'exercises.*.position' => ['required_with:exercises', 'integer', 'min:1'],
            'exercises.*.sets' => ['nullable', 'integer', 'min:1'],
            'exercises.*.reps' => ['nullable', 'integer', 'min:1'],
            'exercises.*.rest_seconds' => ['nullable', 'integer', 'min:0'],
            'exercises.*.notes' => ['nullable', 'string'],
        ];
    }
}
