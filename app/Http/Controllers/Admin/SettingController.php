<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/settings', [
            'settings' => Setting::allValues(),
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $before = Setting::allValues();
        Setting::store($request->validated());

        $changed = array_keys(array_diff_assoc(
            array_map('json_encode', $request->validated()),
            array_map('json_encode', array_intersect_key($before, $request->validated())),
        ));

        if ($changed !== []) {
            AuditLog::record($request->user(), 'settings.updated', 'mengubah pengaturan platform', null, ['fields' => $changed]);
        }

        return back()->with('success', 'Pengaturan disimpan.');
    }
}
