<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\Gender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'role_id' => ['sometimes', 'required', 'integer', Rule::exists('roles', 'id')],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('users', 'username')->ignore($userId)],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:25'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'gender' => ['sometimes', Rule::in(Gender::values())],
            'height' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'weight' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'profile_photo' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
