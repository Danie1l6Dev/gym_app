<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\Gender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_id' => ['nullable', 'integer', Rule::exists('roles', 'id'), 'required_without:role_slug'],
            'role_slug' => ['nullable', 'string', Rule::exists('roles', 'slug'), 'required_without:role_id'],
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:50', Rule::unique('users', 'username')],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:25'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['sometimes', Rule::in(Gender::values())],
            'height' => ['nullable', 'numeric', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'profile_photo' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'membership_plan_type' => ['nullable', 'required_if:role_slug,user', 'required_if:role_id,2', Rule::exists('membership_types', 'code')],
            'membership_ends_at' => ['nullable', 'required_if:role_slug,user', 'required_if:role_id,2', 'date', 'after_or_equal:today'],
            'membership_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
