<?php

use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admins can open the admin dashboard with live stats', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->count(2)->create();
    Opportunity::factory()->count(3)->create();
    Organization::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('userStats.total', 3)
            ->where('userStats.roles.admin', 1)
            ->where('userStats.roles.peserta', 2)
            ->where('adminBadges.moderation', 3)
            ->where('adminBadges.verification', 1)
            ->has('pendingOpportunities', 3)
            ->has('signups', 14)
            ->missing('latestUsers.0.password'));
});

test('participants can not open the admin dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('guests are redirected from the admin dashboard to login', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('admins are sent to the admin dashboard after logging in', function () {
    $admin = User::factory()->admin()->create();

    $this->post(route('login.store'), [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.dashboard', absolute: false));
});

test('signed-in admins opening the login page go to the admin dashboard', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('login'))
        ->assertRedirect(route('admin.dashboard'));
});

test('admins opening the participant dashboard are sent to the admin dashboard', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});

test('every admin page renders for admins and is forbidden for participants', function (string $route) {
    $this->actingAs(User::factory()->admin()->create())->get(route($route))->assertOk();
    $this->actingAs(User::factory()->create())->get(route($route))->assertForbidden();
})->with([
    'admin.users.index',
    'admin.verifications.index',
    'admin.moderation.index',
    'admin.reports.index',
    'admin.categories.index',
    'admin.audit-logs.index',
    'admin.analytics',
    'admin.settings.edit',
]);
