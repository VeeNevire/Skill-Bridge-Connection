<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateTalentPassportRequest extends FormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'interests' => ['nullable', 'string', 'max:1000'],
            'preferred_location' => ['nullable', 'string', 'max:255'],
            'preferred_level' => ['nullable', 'string', 'max:255'],
            'preferred_opportunity' => ['nullable', 'in:beasiswa,kelas,lowongan'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'portfolio_url' => ['nullable', 'url:http,https', 'max:2048'],
            'educations' => ['present', 'array', 'max:20'],
            'educations.*' => ['required', 'array:institution,degree,field,start_year,end_year'],
            'educations.*.institution' => ['required', 'string', 'max:255'],
            'educations.*.degree' => ['required', 'string', 'max:255'],
            'educations.*.field' => ['nullable', 'string', 'max:255'],
            'educations.*.start_year' => ['nullable', 'integer', 'between:1900,2100'],
            'educations.*.end_year' => ['nullable', 'integer', 'between:1900,2100'],
            'skills' => ['present', 'array', 'max:30'],
            'skills.*' => ['required', 'array:name,level'],
            'skills.*.name' => ['required', 'string', 'max:255'],
            'skills.*.level' => ['required', Rule::in(['pemula', 'menengah', 'mahir'])],
            'experiences' => ['present', 'array', 'max:20'],
            'experiences.*' => ['required', 'array:title,organization,description'],
            'experiences.*.title' => ['required', 'string', 'max:255'],
            'experiences.*.organization' => ['required', 'string', 'max:255'],
            'experiences.*.description' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            foreach ((array) $this->input('educations', []) as $index => $education) {
                if (! is_array($education) || $validator->errors()->has("educations.$index.start_year") || $validator->errors()->has("educations.$index.end_year")) {
                    continue;
                }
                $start = $education['start_year'] ?? null;
                $end = $education['end_year'] ?? null;
                if ($start !== null && $start !== '' && $end !== null && $end !== '' && (int) $end < (int) $start) {
                    $validator->errors()->add("educations.$index.end_year", 'Tahun selesai tidak boleh lebih awal dari tahun mulai.');
                }
            }
        }];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'max' => ':attribute terlalu panjang atau terlalu banyak.',
            'url' => ':attribute harus berupa tautan http atau https yang valid.',
            'integer' => ':attribute harus berupa angka tahun.',
            'between' => ':attribute harus antara 1900 dan 2100.',
            'gte' => 'Tahun selesai tidak boleh lebih awal dari tahun mulai.',
            'in' => ':attribute tidak valid.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['name' => 'Nama', 'phone' => 'Nomor telepon', 'bio' => 'Ringkasan', 'portfolio_url' => 'Tautan portofolio', 'educations.*.institution' => 'Institusi', 'educations.*.degree' => 'Jenjang', 'educations.*.field' => 'Bidang studi', 'educations.*.start_year' => 'Tahun mulai', 'educations.*.end_year' => 'Tahun selesai', 'skills.*.name' => 'Keterampilan', 'skills.*.level' => 'Tingkat penguasaan', 'experiences.*.title' => 'Peran', 'experiences.*.organization' => 'Organisasi', 'experiences.*.description' => 'Deskripsi'];
    }
}
