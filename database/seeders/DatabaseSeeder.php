<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

/**
 * Initial data (local and production): only the first Super Admin account.
 * Roles are inserted by migration; categories, opportunities, and settings
 * stay empty and are managed from the admin panel.
 *
 * Usage: php artisan db:seed --force
 * Default login admin@example.com / "password" — change it right after the first sign-in.
 * ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in the environment override the defaults.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (User::query()->withRole(UserRole::Admin)->exists()) {
            $this->command->info('Akun admin sudah ada, seeder dilewati.');

            return;
        }

        $data = [
            'name' => getenv('ADMIN_NAME') ?: 'Admin SkillBridge',
            'email' => getenv('ADMIN_EMAIL') ?: 'admin@example.com',
            'password' => getenv('ADMIN_PASSWORD') ?: 'password',
        ];

        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            throw new RuntimeException(implode(' ', $validator->errors()->all()));
        }

        $user = new User;
        $user->forceFill([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'email_verified_at' => now(),
        ])->save();

        $user->syncRoles([UserRole::Admin]);

        $this->command->info("Akun admin {$user->email} dibuat.");
        $this->command->warn('Segera ganti kata sandi admin setelah login pertama.');
    }
}
