<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountSettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('account/settings');
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($request->user()->id)]], ['required' => ':attribute wajib diisi.', 'email' => 'Format email tidak valid.', 'unique' => 'Email sudah terdaftar.', 'max' => 'Isian maksimal 255 karakter.']);
        $user = $request->user();
        $user->fill($data);
        if ($user->isDirty('email')) {
            $user->setAttribute('email_verified_at', null);
        }
        $user->save();

        return back()->with('success', 'Informasi akun disimpan.');
    }

    public function password(Request $request): RedirectResponse
    {
        $data = $request->validate(['current_password' => ['required', 'current_password'], 'password' => ['required', 'string', Password::defaults(), 'confirmed']], ['current_password' => 'Kata sandi saat ini tidak sesuai.', 'required' => 'Kata sandi wajib diisi.', 'min' => 'Kata sandi minimal :min karakter.', 'confirmed' => 'Konfirmasi kata sandi tidak sama.']);
        $request->user()->update(['password' => $data['password']]);
        $request->session()->regenerate();

        return back()->with('success', 'Kata sandi diperbarui.');
    }
}
