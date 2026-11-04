<?php

namespace Database\Factories;

use App\Enums\OrganizationType;
use App\Enums\ReviewStatus;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Organization>
 */
class OrganizationFactory extends Factory
{
    public function definition(): array
    {
        $types = OrganizationType::cases();
        $type = $types[array_rand($types)];
        $prefix = match ($type) {
            OrganizationType::Institution => 'Universitas',
            OrganizationType::Company => 'PT',
            OrganizationType::Foundation => 'Yayasan',
        };

        return [
            'name' => $prefix.' '.fake('id_ID')->lastName().' '.fake()->randomElement(['Nusantara', 'Cendekia', 'Mandiri', 'Digital', 'Bangsa']),
            'type' => $type,
            'email' => fake()->unique()->companyEmail(),
            'website' => 'https://'.fake()->domainName(),
            'description' => fake('id_ID')->sentence(12),
            'status' => ReviewStatus::Pending,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn () => ['status' => ReviewStatus::Approved, 'reviewed_at' => now()]);
    }
}
