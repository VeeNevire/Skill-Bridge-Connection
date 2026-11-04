<?php

namespace App\Http\Requests;

use App\Enums\OrganizationType;
use App\Enums\ReviewStatus;
use App\Models\Organization;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class OrganizationProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        $organization = $this->route('organization');
        abort_unless($organization instanceof Organization && DB::table('organization_members')->where('organization_id', $organization->id)->where('user_id', $this->user()?->id)->whereIn('permission', ['owner', 'editor'])->exists(), 404);

        return $organization->status === ReviewStatus::Approved;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $organization = $this->route('organization');
        $types = $organization instanceof Organization && $organization->type === OrganizationType::Company ? ['lowongan'] : ['beasiswa', 'kelas'];

        return ['level' => ['nullable', 'string', 'max:100'], 'location' => ['nullable', 'string', 'max:255'], 'duration' => ['nullable', 'string', 'max:255'], 'work_type' => ['nullable', 'string', 'max:255'], 'requirements' => ['nullable', 'string', 'max:5000'], 'category_id' => ['nullable', 'integer', 'exists:categories,id'], 'title' => ['required', 'string', 'max:255'], 'type' => ['required', Rule::in($types)], 'summary' => ['required', 'string', 'max:10000'], 'deadline' => ['nullable', 'date', 'after_or_equal:today'], 'source_url' => ['required', 'url:http,https', 'max:255'], 'accepts_applications' => ['required', 'boolean']];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $requirements = $this->input('requirements');
            if (! is_string($requirements)) {
                return;
            }
            $lines = array_values(array_filter(array_map('trim', preg_split('/\r?\n/', $requirements) ?: [])));
            if (count($lines) > 30) {
                $validator->errors()->add('requirements', 'Checklist maksimal 30 persyaratan.');
            }
            foreach ($lines as $line) {
                if (mb_strlen($line) > 255) {
                    $validator->errors()->add('requirements', 'Setiap persyaratan maksimal 255 karakter.');
                    break;
                }
            }
        }];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['required' => ':attribute wajib diisi.', 'max' => ':attribute terlalu panjang.', 'url' => 'Tautan resmi harus menggunakan http atau https.', 'date' => 'Tanggal tenggat tidak valid.', 'after_or_equal' => 'Tenggat tidak boleh di masa lalu.', 'in' => 'Jenis peluang tidak sesuai organisasi.'];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['title' => 'Judul', 'type' => 'Jenis', 'summary' => 'Deskripsi', 'source_url' => 'Tautan resmi', 'level' => 'Jenjang', 'location' => 'Lokasi', 'duration' => 'Durasi', 'work_type' => 'Tipe pekerjaan', 'requirements' => 'Persyaratan', 'category_id' => 'Kategori'];
    }
}
