<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Let the request through when the user holds any of the given roles, e.g. `role:mentor`.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        abort_unless($user && collect($roles)->contains(fn (string $role) => $user->hasRole(UserRole::from($role))), 403);

        return $next($request);
    }
}
