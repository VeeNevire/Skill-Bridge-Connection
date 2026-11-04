<?php

namespace Database\Factories;

use App\Enums\ReviewStatus;
use App\Models\MentorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MentorProfile>
 */
class MentorProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'expertise' => fake()->randomElement(['Karier & esai', 'Rekrutmen & CV', 'Data & analitik', 'Desain produk', 'Studi luar negeri', 'Wawancara beasiswa']),
            'years_experience' => fake()->numberBetween(2, 15),
            'bio' => fake('id_ID')->sentence(14),
            'status' => ReviewStatus::Pending,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn () => ['status' => ReviewStatus::Approved, 'reviewed_at' => now()]);
    }
}
