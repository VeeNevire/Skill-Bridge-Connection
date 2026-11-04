<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Remembers that a user finished (or skipped) the guided tour of one role's dashboard,
 * so it is not shown again on any device.
 */
class TourController extends Controller
{
    public function complete(Request $request, string $tour): RedirectResponse
    {
        abort_unless(UserRole::tryFrom($tour) !== null, 404);

        $user = $request->user();
        $completed = $user->completed_tours ?? [];

        if (! in_array($tour, $completed, true)) {
            $user->forceFill(['completed_tours' => [...$completed, $tour]])->save();
        }

        return back();
    }
}
