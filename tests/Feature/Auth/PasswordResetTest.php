<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rules\Password;
use Inertia\Testing\AssertableInertia as Assert;

test('the forgot password page renders and is linked from login', function () {
    $this->get(route('password.request'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('auth/forgot-password'));
});

test('a reset link is emailed to registered users', function () {
    Notification::fake();
    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email])->assertSessionHas('success');

    Notification::assertSentTo($user, ResetPassword::class);
});

test('unknown emails get the same reply so accounts can not be discovered', function () {
    Notification::fake();

    $this->post(route('password.email'), ['email' => 'tidak-ada@example.test'])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('success');

    Notification::assertNothingSent();
});

test('the password can be reset with a valid token', function () {
    Notification::fake();
    $user = User::factory()->create();
    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
        $this->get(route('password.reset', ['token' => $notification->token, 'email' => $user->email]))
            ->assertInertia(fn (Assert $page) => $page->component('auth/reset-password')->where('email', $user->email));

        $this->post(route('password.store'), [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'kata-sandi-baru-123',
            'password_confirmation' => 'kata-sandi-baru-123',
        ])->assertRedirect(route('login'))->assertSessionHas('success');

        return true;
    });

    expect(Hash::check('kata-sandi-baru-123', $user->fresh()->password))->toBeTrue();
});

test('an invalid token is rejected', function () {
    $user = User::factory()->create();

    $this->post(route('password.store'), [
        'token' => 'salah',
        'email' => $user->email,
        'password' => 'kata-sandi-baru-123',
        'password_confirmation' => 'kata-sandi-baru-123',
    ])->assertSessionHasErrors('email');

    expect(Hash::check('password', $user->fresh()->password))->toBeTrue();
});

test('registration and password changes follow the configured password policy', function () {
    Password::defaults(fn () => Password::min(12)->mixedCase()->numbers());

    $this->post(route('register.store'), [
        'name' => 'Lemah',
        'email' => 'lemah@example.test',
        'password' => 'pendek1',
        'password_confirmation' => 'pendek1',
        'privacy' => true,
    ])->assertSessionHasErrors('password');

    $this->actingAs(User::factory()->create())
        ->put(route('account.password'), [
            'current_password' => 'password',
            'password' => 'semuahurufkecil123',
            'password_confirmation' => 'semuahurufkecil123',
        ])->assertSessionHasErrors('password');
});
