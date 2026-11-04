<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMentoringRequest extends FormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['availability_id' => ['required', 'integer'], 'topic' => ['required', 'string', 'max:255'], 'goal' => ['required', 'string', 'max:3000']];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['required' => ':attribute wajib diisi.', 'max' => ':attribute terlalu panjang.', 'integer' => 'Jadwal tidak valid.'];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['topic' => 'Topik', 'goal' => 'Tujuan konsultasi', 'availability_id' => 'Jadwal'];
    }
}
