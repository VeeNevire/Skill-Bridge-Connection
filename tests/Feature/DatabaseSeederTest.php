<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Opportunity;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;

afterEach(function () {
    putenv('ADMIN_NAME');
    putenv('ADMIN_EMAIL');
    putenv('ADMIN_PASSWORD');
});

test('database seeder creates the default admin account', function () {
    $this->seed(DatabaseSeeder::class);

    $admin = User::query()->sole();
    expect($admin->email)->toBe('admin@example.com')
        ->and($admin->hasRole(UserRole::Admin))->toBeTrue()
        ->and(Hash::check('password', $admin->password))->toBeTrue();
});

test('database seeder accepts overrides from the environment', function () {
    putenv('ADMIN_NAME=Admin Produksi');
    putenv('ADMIN_EMAIL=admin@skillbridge.id');
    putenv('ADMIN_PASSWORD=RahasiaKuat#2026');

    $this->seed(DatabaseSeeder::class);

    $admin = User::query()->sole();
    expect($admin->email)->toBe('admin@skillbridge.id')
        ->and($admin->hasRole(UserRole::Admin))->toBeTrue()
        ->and($admin->hasRole(UserRole::Participant))->toBeFalse()
        ->and(Hash::check('RahasiaKuat#2026', $admin->password))->toBeTrue()
        ->and(Category::query()->count())->toBe(0)
        ->and(Opportunity::query()->count())->toBe(0);
});

test('database seeder skips when an admin already exists', function () {
    User::factory()->admin()->create();
    putenv('ADMIN_EMAIL=lain@skillbridge.id');
    putenv('ADMIN_PASSWORD=RahasiaKuat#2026');

    $this->seed(DatabaseSeeder::class);

    expect(User::query()->count())->toBe(1);
});
