<?php

use App\Models\Setting;
use Inertia\Testing\AssertableInertia as Assert;

test('the privacy policy and terms are public and show the configured contact', function (string $route, string $component) {
    Setting::store(['support_email' => 'privasi@skillbridge.test']);

    $this->get(route($route))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->where('supportEmail', 'privasi@skillbridge.test')
            ->has('platformName'));
})->with([
    'privacy' => ['legal.privacy', 'legal/privacy'],
    'terms' => ['legal.terms', 'legal/terms'],
]);
