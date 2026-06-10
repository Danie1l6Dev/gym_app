<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMembershipTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $membershipType = $this->route('membershipType');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:60',
                'alpha_dash',
                Rule::unique('membership_types', 'code')->ignore($membershipType?->id),
            ],
            'duration_days' => ['sometimes', 'required', 'integer', 'min:1', 'max:3650'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
