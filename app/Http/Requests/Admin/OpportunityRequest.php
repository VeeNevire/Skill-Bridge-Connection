<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** A scholarship, internship or job the admin enters by hand. */
class OpportunityRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string', 'max:3000'],
            'deadline' => ['nullable', 'date'],
            'source_url' => ['nullable', 'url:http,https', 'max:255'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'penyelenggara' => ['nullable', 'string', 'max:120'],
            'lokasi' => ['nullable', 'string', 'max:100'],
            'jenjang' => ['nullable', Rule::in(['S1', 'S2', 'S3'])],
            'tipe_kerja' => ['nullable', Rule::in(['Magang', 'Penuh waktu', 'Paruh waktu'])],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function opportunity(): array
    {
        $data = $this->validated();

        return [
            'title' => $data['title'],
            'summary' => $data['summary'] ?? null,
            'deadline' => $data['deadline'] ?? null,
            'source_url' => $data['source_url'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            // Same keys the catalog filters read from `details`.
            'details' => array_filter([
                'penyelenggara' => $data['penyelenggara'] ?? null,
                'lokasi' => $data['lokasi'] ?? null,
                'jenjang' => $data['jenjang'] ?? null,
                'tipe_kerja' => $data['tipe_kerja'] ?? null,
            ]) ?: null,
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul wajib diisi.',
            'source_url.url' => 'URL harus diawali http:// atau https://.',
            'deadline.date' => 'Tanggal tidak valid.',
        ];
    }
}
