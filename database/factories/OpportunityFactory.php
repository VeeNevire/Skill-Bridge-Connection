<?php

namespace Database\Factories;

use App\Enums\OpportunityType;
use App\Enums\ReviewStatus;
use App\Models\Opportunity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Opportunity>
 */
class OpportunityFactory extends Factory
{
    public function definition(): array
    {
        $types = OpportunityType::cases();
        $type = $types[array_rand($types)];

        [$title, $details] = match ($type) {
            OpportunityType::Scholarship => [
                'Beasiswa '.fake()->randomElement(['Prestasi', 'Pemimpin Muda', 'Riset', 'Magister', 'Afirmasi']).' '.fake()->numberBetween(2026, 2027),
                ['jenjang' => fake()->randomElement(['S1', 'S2', 'S3']), 'lokasi' => fake()->randomElement(['Dalam negeri', 'Luar negeri'])],
            ],
            OpportunityType::Course => [
                'Kelas '.fake()->randomElement(['Dasar Analisis Data', 'Menulis Esai', 'UI/UX Design', 'Public Speaking', 'Bahasa Inggris Akademik']),
                ['durasi' => fake()->numberBetween(2, 12).' minggu', 'level' => fake()->randomElement(['Pemula', 'Menengah'])],
            ],
            OpportunityType::Job => [
                fake()->randomElement(['Magang', 'Junior', 'Staf']).' '.fake()->randomElement(['Frontend Developer', 'Data Analyst', 'Product Designer', 'Marketing', 'HR']),
                ['tipe_kerja' => fake()->randomElement(['Penuh waktu', 'Magang', 'Paruh waktu']), 'lokasi' => fake('id_ID')->city()],
            ],
        };

        return [
            'type' => $type,
            'title' => $title,
            'summary' => fake('id_ID')->sentence(16),
            'details' => $details,
            'deadline' => fake()->dateTimeBetween('+1 week', '+4 months'),
            'source_url' => 'https://'.fake()->domainName(),
            'status' => ReviewStatus::Pending,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => ['status' => ReviewStatus::Approved, 'reviewed_at' => now()]);
    }
}
