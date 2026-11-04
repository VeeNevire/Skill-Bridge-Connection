<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('account settings updates identity and checks current password', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->put(route('account.update'), ['name' => 'Nama baru', 'email' => 'baru@example.com'])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Nama baru', 'email' => 'baru@example.com', 'email_verified_at' => null]);
    $this->actingAs($user)->put(route('account.password'), ['current_password' => 'salah', 'password' => 'passwordbaru123', 'password_confirmation' => 'passwordbaru123'])->assertSessionHasErrors('current_password');
    $this->actingAs($user)->put(route('account.password'), ['current_password' => 'password', 'password' => 'passwordbaru123', 'password_confirmation' => 'passwordbaru123'])->assertSessionHasNoErrors();
    expect(Hash::check('passwordbaru123', $user->fresh()->password))->toBeTrue();
});

test('suspended sessions cannot keep changing connected platform data', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $user->forceFill(['suspended_at' => now()])->save();
    $this->put(route('account.update'), ['name' => 'Diganti', 'email' => $user->email])->assertForbidden();
    expect($user->fresh()->name)->not->toBe('Diganti');
    $this->post(route('logout'))->assertRedirect(route('home'));
    $this->assertGuest();
});
