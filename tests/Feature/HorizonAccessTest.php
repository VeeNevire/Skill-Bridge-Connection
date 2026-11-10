<?php

use App\Models\User;
use Illuminate\Support\Facades\Gate;

test('horizon redirects guests to login', function () {
    $this->get('/horizon')->assertRedirect(route('login'));
});

test('horizon rejects participants', function () {
    $this->actingAs(User::factory()->create())->get('/horizon')->assertForbidden();
});

test('horizon allows administrators in production', function () {
    app()->instance('env', 'production');
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/horizon')->assertOk();
    expect(Gate::forUser($admin)->allows('viewHorizon'))->toBeTrue();
});

test('horizon rejects suspended administrators', function () {
    $admin = User::factory()->admin()->create(['suspended_at' => now()]);
    $this->actingAs($admin)->get('/horizon')->assertForbidden();
    expect(Gate::forUser($admin)->allows('viewHorizon'))->toBeFalse();
});
