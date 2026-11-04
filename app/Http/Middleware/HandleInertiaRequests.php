<?php

namespace App\Http\Middleware;

use App\Support\AccountActivity;
use App\Support\AdminStats;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'profileCompletion' => fn () => AccountActivity::completion($request->user()),
            'accountActivity' => fn () => AccountActivity::items($request->user()),
            'auth' => [
                'user' => $request->user()?->loadMissing('roles:id,name,label'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
            // Sidebar badge counts, only computed (from cache) on admin pages.
            'adminBadges' => fn () => $request->routeIs('admin.*') ? AdminStats::badges() : null,
        ];
    }
}
