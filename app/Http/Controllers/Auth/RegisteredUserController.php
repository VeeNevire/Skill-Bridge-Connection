<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Setting;
use App\Models\User;
use App\Support\AdminStats;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    public function store(RegisterRequest $request): RedirectResponse
    {
        if (! Setting::allValues()['registration_open']) {
            throw ValidationException::withMessages(['privacy' => 'Pendaftaran akun sedang ditutup.']);
        }

        $user = DB::transaction(function () use ($request) {
            $user = User::query()->create($request->safe()->only(['name', 'email', 'password']));
            $user->forceFill(['privacy_accepted_at' => now()])->save();
            $user->assignRole(UserRole::Participant);

            return $user;
        });

        AdminStats::flush();
        event(new Registered($user));
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}
