<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class MembershipIndexRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $payload = [];

        if ($this->has('per_page')) {
            $payload['per_page'] = $this->integer('per_page');
        }

        if ($this->has('days')) {
            $payload['days'] = $this->integer('days');
        }

        if ($payload !== []) {
            $this->merge($payload);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'days' => ['sometimes', 'integer', 'min:1', 'max:365'],
        ];
    }
}
