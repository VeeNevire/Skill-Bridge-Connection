<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public legal pages. Contact details come from the admin settings so they stay in sync.
 */
class LegalController extends Controller
{
    public function privacy(): Response
    {
        return Inertia::render('legal/privacy', $this->contact());
    }

    public function terms(): Response
    {
        return Inertia::render('legal/terms', $this->contact());
    }

    /**
     * @return array{platformName: string, supportEmail: string}
     */
    private function contact(): array
    {
        $settings = Setting::allValues();

        return [
            'platformName' => (string) $settings['platform_name'],
            'supportEmail' => (string) $settings['support_email'],
        ];
    }
}
