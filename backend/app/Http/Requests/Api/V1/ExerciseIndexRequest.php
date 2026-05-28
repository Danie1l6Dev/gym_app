<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExerciseIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'muscle_id' => ['sometimes', 'integer', Rule::exists('muscles', 'id')],
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'nombre' => ['sometimes', 'nullable', 'string', 'max:255'],
            'body_part' => ['sometimes', 'nullable', 'string', 'max:255'],
            'target_muscle' => ['sometimes', 'nullable', 'string', 'max:255'],
            'equipment' => ['sometimes', 'nullable', 'string', 'max:255'],
            'source' => ['sometimes', 'nullable', 'string', 'max:100'],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
