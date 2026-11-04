<?php

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\PrivateDocument;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('the user list is paginated on the server and can be searched and filtered', function () {
    User::factory()->count(20)->create();
    User::factory()->create(['name' => 'Siti Aminah', 'email' => 'siti@example.test']);

    $this->actingAs($this->admin)
        ->get(route('admin.users.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 15)
            ->where('users.total', 22));

    $this->actingAs($this->admin)
        ->get(route('admin.users.index', ['q' => 'siti']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.email', 'siti@example.test'));

    $this->actingAs($this->admin)
        ->get(route('admin.users.index', ['role' => 'admin']))
        ->assertInertia(fn (Assert $page) => $page->where('users.total', 1)->has('roles', 5));
});

test('one account can hold several roles and the change is audited', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->patch(route('admin.users.update', $user), ['roles' => ['peserta', 'mentor', 'mitra']])
        ->assertRedirect()
        ->assertSessionHas('success');

    $user->refresh();

    expect($user->hasRole(UserRole::Participant))->toBeTrue()
        ->and($user->hasRole(UserRole::Mentor))->toBeTrue()
        ->and($user->hasRole(UserRole::Partner))->toBeTrue()
        ->and($user->isAdmin())->toBeFalse()
        ->and(AuditLog::query()->where('action', 'user.role')->where('subject_id', $user->id)->exists())->toBeTrue();

    $this->actingAs($this->admin)
        ->get(route('admin.users.index', ['role' => 'mentor']))
        ->assertInertia(fn (Assert $page) => $page->where('users.total', 1)->has('users.data.0.roles', 3));
});

test('a user must keep at least one valid role', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['roles' => []])->assertSessionHasErrors('roles');
    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['roles' => ['raja']])->assertSessionHasErrors('roles.0');

    expect($user->fresh()->hasRole(UserRole::Participant))->toBeTrue();
});

test('new accounts start as participants', function () {
    expect(User::factory()->create()->roles->pluck('name')->all())->toBe([UserRole::Participant]);
});

test('admins can suspend a user, who then can not log in', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['suspended' => true]);
    expect($user->fresh()->isSuspended())->toBeTrue();

    auth()->logout();

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('admins can not change their own account', function () {
    $this->actingAs($this->admin)
        ->patch(route('admin.users.update', $this->admin), ['roles' => ['peserta']])
        ->assertForbidden();

    expect($this->admin->fresh()->isAdmin())->toBeTrue();
});

test('participants can not manage users', function () {
    $this->actingAs(User::factory()->create())
        ->patch(route('admin.users.update', User::factory()->create()), ['roles' => ['admin']])
        ->assertForbidden();
});

test('admins can add a user with chosen roles', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.users.store'), [
            'name' => 'Budi Santoso',
            'email' => 'Budi@Example.test',
            'password' => 'rahasia-kuat-123',
            'roles' => ['mentor', 'peserta'],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $user = User::query()->where('email', 'budi@example.test')->firstOrFail();

    expect($user->hasRole(UserRole::Mentor))->toBeTrue()
        ->and($user->hasRole(UserRole::Participant))->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull()
        ->and(AuditLog::query()->where('action', 'user.created')->where('subject_id', $user->id)->exists())->toBeTrue();

    auth()->logout();
    $this->post(route('login.store'), ['email' => 'budi@example.test', 'password' => 'rahasia-kuat-123']);
    $this->assertAuthenticatedAs($user);
});

test('adding a user validates the input', function () {
    User::factory()->create(['email' => 'ada@example.test']);

    $this->actingAs($this->admin)
        ->post(route('admin.users.store'), ['name' => '', 'email' => 'ada@example.test', 'password' => '123', 'roles' => []])
        ->assertSessionHasErrors(['name', 'email', 'password', 'roles']);

    expect(User::query()->count())->toBe(2);
});

test('participants can not add users', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('admin.users.store'), ['name' => 'X', 'email' => 'x@example.test', 'password' => 'rahasia-kuat-123', 'roles' => ['admin']])
        ->assertForbidden();
});

test('admins can edit a user name and email', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->patch(route('admin.users.update', $user), ['name' => 'Nama Baru', 'email' => 'Baru@Example.test'])
        ->assertSessionHasNoErrors();

    expect($user->fresh())->name->toBe('Nama Baru')->email->toBe('baru@example.test')
        ->and(AuditLog::query()->where('action', 'user.updated')->where('subject_id', $user->id)->exists())->toBeTrue();

    $other = User::factory()->create();
    $this->actingAs($this->admin)
        ->patch(route('admin.users.update', $other), ['email' => 'baru@example.test'])
        ->assertSessionHasErrors('email');
});

test('admins can delete a user together with their private files', function () {
    Storage::fake('local');
    $user = User::factory()->create();
    Storage::disk('local')->put("documents/{$user->id}/cv.pdf", 'isi');
    (new PrivateDocument)->forceFill([
        'user_id' => $user->id, 'title' => 'CV', 'kind' => 'cv', 'path' => "documents/{$user->id}/cv.pdf", 'original_name' => 'cv.pdf',
    ])->save();

    $this->actingAs($this->admin)->delete(route('admin.users.destroy', $user))->assertSessionHas('success');

    expect(User::query()->whereKey($user->id)->exists())->toBeFalse()
        ->and(AuditLog::query()->where('action', 'user.deleted')->exists())->toBeTrue();
    Storage::disk('local')->assertMissing("documents/{$user->id}/cv.pdf");
});

test('admins can not delete themselves', function () {
    $this->actingAs($this->admin)->delete(route('admin.users.destroy', $this->admin))->assertForbidden();
});

test('the sole owner of an organization can not be deleted', function () {
    $owner = User::factory()->create();
    $organization = Organization::factory()->create();
    DB::table('organization_members')->insert([
        'organization_id' => $organization->id, 'user_id' => $owner->id, 'permission' => 'owner', 'created_at' => now(), 'updated_at' => now(),
    ]);

    $this->actingAs($this->admin)->delete(route('admin.users.destroy', $owner))->assertSessionHasErrors('user');

    expect(User::query()->whereKey($owner->id)->exists())->toBeTrue();
});

test('participants can not delete users', function () {
    $this->actingAs(User::factory()->create())
        ->delete(route('admin.users.destroy', User::factory()->create()))
        ->assertForbidden();
});
