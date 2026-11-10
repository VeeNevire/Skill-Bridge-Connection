<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ScrapeSourceRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            // Optional: empty means the AI searches the web using the keywords instead. Only public web pages.
            'url' => ['nullable', 'url:http,https', 'max:500'],
            'keywords' => ['nullable', 'required_without:url', 'string', 'max:500'],
            'is_active' => ['boolean'],
            // All optional: no schedule means daily at 03:00 WIB.
            'schedule' => ['nullable', 'in:harian,menit,mingguan'],
            'schedule_every' => ['nullable', 'integer', $this->input('schedule') === 'mingguan' ? 'between:1,52' : 'between:5,10080'],
            'schedule_time' => ['nullable', 'date_format:H:i'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama sumber wajib diisi.',
            'url.url' => 'URL harus diawali http:// atau https://.',
            'schedule_every.between' => $this->input('schedule') === 'mingguan' ? 'Isi antara 1 dan 52 minggu.' : 'Isi antara 5 dan 10080 menit.',
            'schedule_time.date_format' => 'Format jam HH:MM, contoh 07:30.',
            'keywords.required_without' => 'Isi kata kunci pencarian AI jika URL website dikosongkan.',
        ];
    }
}
