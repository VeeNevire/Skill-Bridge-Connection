<?php

use App\Enums\UserRole;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

function registrationData(): array
{
    return ['name' => 'Ayu Putri', 'email' => 'ayu@example.com', 'password' => 'password123', 'password_confirmation' => 'password123', 'privacy' => true];
}

test('a participant can register and is signed in', function () {
    $this->post(route('register.store'), [...registrationData(), 'role' => 'admin'])
        ->assertRedirect(route('dashboard'));

    $user = User::query()->where('email', 'ayu@example.com')->firstOrFail();
    $this->assertAuthenticatedAs($user);
    expect($user->hasRole(UserRole::Participant))->toBeTrue()
        ->and($user->hasRole(UserRole::Admin))->toBeFalse()
        ->and($user->privacy_accepted_at)->not->toBeNull()
        ->and(Hash::check('password123', $user->password))->toBeTrue();
});

test('registration validates input and consent', function (array $changes, string $field) {
    $this->post(route('register.store'), [...registrationData(), ...$changes])->assertSessionHasErrors($field);
    $this->assertGuest();
    expect(User::query()->where('email', 'ayu@example.com')->exists())->toBeFalse();
})->with([
    'name' => [['name' => ''], 'name'],
    'email' => [['email' => 'bad'], 'email'],
    'password' => [['password' => 'short'], 'password'],
    'confirmation' => [['password_confirmation' => 'different'], 'password'],
    'consent' => [['privacy' => false], 'privacy'],
]);

test('duplicate email cannot register', function () {
    User::factory()->create(['email' => 'ayu@example.com']);
    $this->post(route('register.store'), registrationData())->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('registration can be closed by an admin setting', function () {
    Setting::store(['registration_open' => false]);
    $this->post(route('register.store'), registrationData())->assertSessionHasErrors('privacy');
    $this->assertGuest();
    expect(User::query()->where('email', 'ayu@example.com')->exists())->toBeFalse();
});
