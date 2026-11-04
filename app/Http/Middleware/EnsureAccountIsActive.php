<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        abort_if(! $request->routeIs('logout') && $request->user()?->isSuspended(), 403, 'Akun ini sedang ditangguhkan.');

        return $next($request);
    }
}
