<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('each role can open its own dashboard', function (UserRole $role, string $component) {
    $this->actingAs(User::factory()->withRoles($role)->create())
        ->get(route($role->homeRoute()))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'mentor' => [UserRole::Mentor, 'mentor/dashboard'],
    'mitra' => [UserRole::Partner, 'partner/dashboard'],
    'perusahaan' => [UserRole::Company, 'company/dashboard'],
    'peserta' => [UserRole::Participant, 'dashboard'],
]);

test('role dashboards are forbidden without the role', function (string $route) {
    $this->actingAs(User::factory()->create())->get(route($route))->assertForbidden();
})->with(['mentor.dashboard', 'partner.dashboard', 'company.dashboard']);

test('users land on their highest-priority dashboard after login', function (array $roles, string $expected) {
    $user = User::factory()->withRoles(...$roles)->create();

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route($expected, absolute: false));
})->with([
    'peserta only' => [[UserRole::Participant], 'dashboard'],
    'peserta + mentor' => [[UserRole::Participant, UserRole::Mentor], 'mentor.dashboard'],
    'mitra' => [[UserRole::Partner], 'partner.dashboard'],
    'perusahaan + peserta' => [[UserRole::Company, UserRole::Participant], 'company.dashboard'],
]);

test('accounts without the participant role are sent from /dashboard to their own dashboard', function () {
    $this->actingAs(User::factory()->withRoles(UserRole::Company)->create())
        ->get(route('dashboard'))
        ->assertRedirect(route('company.dashboard'));
});

test('multi-role accounts can still open every dashboard they hold', function () {
    $user = User::factory()->withRoles(UserRole::Participant, UserRole::Mentor)->create();

    $this->actingAs($user)->get(route('dashboard'))->assertOk();
    $this->actingAs($user)->get(route('mentor.dashboard'))->assertOk();
    $this->actingAs($user)->get(route('company.dashboard'))->assertForbidden();
});
