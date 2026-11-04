<?php

namespace App\Http\Controllers;

use App\Enums\ReviewStatus;
use App\Models\Application;
use App\Models\ContentReport;
use App\Models\Opportunity;
use App\Support\AdminStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OpportunityDetailController extends Controller
{
    private function published(Opportunity $opportunity): void
    {
        abort_unless($opportunity->status === ReviewStatus::Approved && (! $opportunity->deadline || $opportunity->deadline->gte(today())), 404);
        if ($opportunity->getAttribute('organization_id')) {
            $opportunity->loadMissing('organization:id,name,status');
            abort_unless($opportunity->organization?->status === ReviewStatus::Approved, 404);
        }
    }

    public function show(Request $request, Opportunity $opportunity): Response
    {
        $this->published($opportunity);
        $opportunity->loadMissing('organization:id,name,status');

        return Inertia::render('catalog/show', ['opportunity' => $opportunity->only(['id', 'type', 'title', 'summary', 'details', 'deadline', 'source_url', 'reviewed_at', 'accepts_applications', 'organization'])]);
    }

    public function report(Request $request, Opportunity $opportunity): RedirectResponse
    {
        $this->published($opportunity);
        $data = $request->validate(['reason' => ['required', 'string', 'max:255'], 'details' => ['nullable', 'string', 'max:3000']], ['required' => 'Alasan laporan wajib diisi.', 'max' => 'Isian terlalu panjang.']);
        $report = new ContentReport($data);
        $report->forceFill(['opportunity_id' => $opportunity->id, 'reporter_id' => $request->user()->id, 'severity' => 'sedang'])->save();
        AdminStats::flush();

        return back()->with('success', 'Laporan dikirim ke admin.');
    }

    public function apply(Request $request, Opportunity $opportunity): RedirectResponse
    {
        $this->published($opportunity);
        abort_unless($opportunity->getAttribute('accepts_applications') && $opportunity->getAttribute('organization_id'), 404);
        $data = $request->validate(['consent' => ['accepted'], 'message' => ['required', 'string', 'max:5000'], 'portfolio_url' => ['nullable', 'url:http,https', 'max:2048']], ['consent.accepted' => 'Persetujuan berbagi data wajib diberikan.', 'message.required' => 'Pesan pendaftaran wajib diisi.', 'message.max' => 'Pesan maksimal 5000 karakter.', 'portfolio_url.url' => 'Tautan portofolio harus berupa http atau https.']);
        DB::transaction(function () use ($request, $opportunity, $data) {
            DB::table('organization_applications')->insertOrIgnore(['user_id' => $request->user()->id, 'opportunity_id' => $opportunity->id, 'message' => $data['message'], 'portfolio_url' => $data['portfolio_url'] ?? null, 'consented_at' => now(), 'created_at' => now(), 'updated_at' => now()]);
            Application::query()->firstOrCreate(['user_id' => $request->user()->id, 'opportunity_id' => $opportunity->id], ['status' => 'dikirim']);
        });

        return to_route('applications.index')->with('success', 'Pendaftaran dikirim ke organisasi.');
    }
}
