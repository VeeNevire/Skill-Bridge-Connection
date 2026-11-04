<?php

namespace Database\Factories;

use App\Enums\ReportSeverity;
use App\Enums\ReportStatus;
use App\Models\ContentReport;
use App\Models\Opportunity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentReport>
 */
class ContentReportFactory extends Factory
{
    public function definition(): array
    {
        return [
            'opportunity_id' => Opportunity::factory(),
            'reason' => fake()->randomElement(['Dugaan penipuan', 'Informasi kedaluwarsa', 'Tautan tidak valid', 'Konten tidak pantas', 'Duplikat']),
            'details' => fake('id_ID')->sentence(10),
            'severity' => fake()->randomElement(ReportSeverity::cases()),
            'status' => ReportStatus::Open,
        ];
    }
}
