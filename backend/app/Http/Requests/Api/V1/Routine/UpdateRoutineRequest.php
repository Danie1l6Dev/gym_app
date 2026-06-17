<?php

namespace App\Http\Requests\Api\V1\Routine;

use App\Http\Requests\Api\V1\Routine\Concerns\ValidatesRoutineDays;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRoutineRequest extends FormRequest
{
    use ValidatesRoutineDays;

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
            'days' => ['sometimes', 'array'],
            'days.*' => ['integer', 'distinct', 'exists:days,id'],
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
