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

    protected function prepareForValidation(): void
    {
        $this->mergeBooleanQueryParam('has_gif');
        $this->mergeBooleanQueryParam('with_gif');
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
            'has_gif' => ['sometimes', 'boolean'],
            'with_gif' => ['sometimes', 'boolean'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    private function mergeBooleanQueryParam(string $key): void
    {
        if (! $this->has($key)) {
            return;
        }

        $this->merge([
            $key => filter_var($this->input($key), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);
    }
}
