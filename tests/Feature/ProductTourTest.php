<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a new account has not seen any tour', function () {
    $user = User::factory()->create()->fresh();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('auth.user.completed_tours', null));
});

test('finishing a tour is remembered once per role', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('tours.complete', 'peserta'))->assertRedirect();
    $this->actingAs($user)->post(route('tours.complete', 'peserta'))->assertRedirect();
    $this->actingAs($user)->post(route('tours.complete', 'mentor'))->assertRedirect();

    expect($user->fresh()->completed_tours)->toBe(['peserta', 'mentor']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('auth.user.completed_tours', ['peserta', 'mentor']));
});

test('only known tours can be completed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('tours.complete', 'rahasia'))->assertNotFound();

    expect($user->fresh()->completed_tours)->toBeNull();
});

test('guests cannot complete a tour', function () {
    $this->post(route('tours.complete', 'peserta'))->assertRedirect(route('login'));
});
