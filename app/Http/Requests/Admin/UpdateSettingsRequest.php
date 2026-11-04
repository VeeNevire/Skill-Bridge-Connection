<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'platform_name' => ['required', 'string', 'max:80'],
            'support_email' => ['required', 'email', 'max:120'],
            'registration_open' => ['required', 'boolean'],
            'require_moderation' => ['required', 'boolean'],
            'announcement' => ['nullable', 'string', 'max:200'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'platform_name.required' => 'Nama platform wajib diisi.',
            'support_email.email' => 'Format email tidak valid.',
        ];
    }
}
