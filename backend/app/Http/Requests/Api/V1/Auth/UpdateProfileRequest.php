<?php

namespace App\Http\Requests\Api\V1\Auth;

use App\Enums\Gender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('users', 'username')->ignore($userId)],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:25'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'gender' => ['sometimes', Rule::in(Gender::values())],
            'height' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'weight' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'profile_photo' => ['sometimes', 'nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'profile_photo.file' => 'Selecciona una imagen válida para la foto de perfil.',
            'profile_photo.mimes' => 'La foto debe estar en formato JPG, PNG o WEBP.',
            'profile_photo.max' => 'La foto no puede pesar más de 2 MB.',
        ];
    }
}
