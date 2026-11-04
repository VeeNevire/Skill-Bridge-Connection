<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

function passportData(): array
{
    return [
        'name' => 'Ayu Putri', 'phone' => '08123456789', 'bio' => 'Mahasiswa', 'portfolio_url' => 'https://example.com',
        'educations' => [['institution' => 'Universitas Nusantara', 'degree' => 'S1', 'field' => 'Informatika', 'start_year' => 2022, 'end_year' => 2026]],
        'skills' => [['name' => 'PHP', 'level' => 'menengah']],
        'experiences' => [['title' => 'Pengembang', 'organization' => 'Komunitas', 'description' => 'Membangun aplikasi']],
    ];
}

test('participants can create and update their own passport', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->put(route('passport.update'), passportData())->assertRedirect(route('passport.edit'));
    $this->assertDatabaseHas('talent_profiles', ['user_id' => $user->id, 'phone' => '08123456789']);
    $this->assertDatabaseHas('educations', ['user_id' => $user->id, 'institution' => 'Universitas Nusantara']);
    $this->assertDatabaseHas('talent_skills', ['user_id' => $user->id, 'name' => 'PHP']);
    $this->assertDatabaseHas('experiences', ['user_id' => $user->id, 'title' => 'Pengembang']);
    $this->actingAs($user)->get(route('passport.edit'))->assertInertia(fn (Assert $page) => $page->component('dashboard')->where('passport.name', 'Ayu Putri')->where('passport.educations.0.degree', 'S1'));
    $this->actingAs($user)->put(route('passport.update'), [...passportData(), 'skills' => [], 'educations' => [], 'experiences' => []])->assertRedirect();
    $this->assertDatabaseMissing('talent_skills', ['user_id' => $user->id]);
    $this->assertDatabaseMissing('educations', ['user_id' => $user->id]);
    $this->assertDatabaseMissing('experiences', ['user_id' => $user->id]);
});

test('passport data is isolated between participants', function () {
    $first = User::factory()->create();
    $second = User::factory()->create();
    $this->actingAs($first)->put(route('passport.update'), passportData());
    $this->actingAs($second)->get(route('passport.edit'))->assertInertia(fn (Assert $page) => $page->where('passport.educations', [])->where('passport.skills', []));
    $this->actingAs($second)->put(route('passport.update'), [...passportData(), 'skills' => []]);
    $this->assertDatabaseHas('talent_skills', ['user_id' => $first->id, 'name' => 'PHP']);
});

test('passport requires authentication and participant role', function () {
    $this->get(route('passport.edit'))->assertRedirect(route('login'));
    $this->put(route('passport.update'), passportData())->assertRedirect(route('login'));
    $user = User::factory()->withRoles(UserRole::Mentor)->create();
    $this->actingAs($user)->get(route('passport.edit'))->assertForbidden();
    $this->actingAs($user)->put(route('passport.update'), passportData())->assertForbidden();
});

test('passport validates nested data without saving', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->put(route('passport.update'), [...passportData(), 'portfolio_url' => 'javascript:alert(1)', 'skills' => [['name' => '', 'level' => 'ahli']], 'educations' => [['institution' => '', 'degree' => 'S1', 'start_year' => 2026, 'end_year' => 2020]]])
        ->assertSessionHasErrors(['portfolio_url', 'skills.0.name', 'skills.0.level', 'educations.0.institution', 'educations.0.end_year']);
    expect(DB::table('talent_profiles')->where('user_id', $user->id)->exists())->toBeFalse();
});

test('year can be provided without a starting year', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->put(route('passport.update'), [...passportData(), 'educations' => [['institution' => 'Kampus', 'degree' => 'S1', 'start_year' => null, 'end_year' => 2020]]])->assertSessionHasNoErrors();
});
