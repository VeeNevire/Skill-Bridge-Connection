<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/forgot-password');
    }

    /**
     * Email a reset link. The reply is the same whether or not the address exists,
     * so the form can not be used to discover which emails are registered.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate(
            ['email' => ['required', 'email']],
            ['email.required' => 'Email wajib diisi.', 'email.email' => 'Format email tidak valid.'],
        );

        Password::sendResetLink($request->only('email'));

        return back()->with('success', 'Jika email terdaftar, tautan untuk mengatur ulang kata sandi sudah dikirim. Periksa kotak masuk Anda.');
    }
}
