<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OpportunityType;
use App\Http\Controllers\Controller;
use App\Jobs\DiscoverSites;
use App\Jobs\RunScraper;
use App\Models\AuditLog;
use App\Models\DiscoveredSite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Admin-only directory of websites found by the monthly AI search, with an approval checkbox per site. */
class DiscoveredSiteController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'type' => ['nullable', Rule::in(ScrapeSourceController::TYPES)],
            'period' => ['nullable', 'string', 'size:7'],
            'status' => ['nullable', 'in:disetujui,belum'],
            'q' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'in:10,25,50'],
        ]);

        return Inertia::render('admin/sites/index', [
            'sites' => DiscoveredSite::query()
                ->when($filters['type'] ?? null, fn ($q, string $type) => $q->where('type', $type))
                ->when($filters['period'] ?? null, fn ($q, string $period) => $q->where('period', $period))
                ->when($filters['status'] ?? null, fn ($q, string $status) => $q->where('is_approved', $status === 'disetujui'))
                ->when($filters['q'] ?? null, fn ($q, string $term) => $q->where(fn ($q) => $q->where('name', 'like', "%{$term}%")->orWhere('url', 'like', "%{$term}%")))
                ->orderByDesc('period')->orderBy('name')
                ->paginate($filters['per_page'] ?? 25)->withQueryString(),
            'filters' => $filters,
            'periods' => DiscoveredSite::query()->distinct()->orderByDesc('period')->pluck('period'),
        ]);
    }

    /** Approving turns the site into a scraper source and pulls its listings now; unapproving pauses that source. */
    public function update(Request $request, DiscoveredSite $discoveredSite): RedirectResponse
    {
        $approve = $request->validate(['is_approved' => ['required', 'boolean']])['is_approved'];

        if ($approve) {
            RunScraper::dispatch($discoveredSite->approveAsSource());
            AuditLog::record($request->user(), 'site.approval', "menyetujui website {$discoveredSite->name} sebagai sumber scraper", $discoveredSite);

            return back()->with('success', "{$discoveredSite->name} masuk scraper {$discoveredSite->type->label()}. Data sedang ditarik.");
        }

        // Pause instead of delete: deleting the source would also delete the listings it already pulled.
        $discoveredSite->scrapeSource?->update(['is_active' => false]);
        $discoveredSite->update(['is_approved' => false]);
        AuditLog::record($request->user(), 'site.approval', "membatalkan persetujuan website {$discoveredSite->name}", $discoveredSite);

        return back()->with('success', "Scraper {$discoveredSite->name} dinonaktifkan.");
    }

    public function run(Request $request): RedirectResponse
    {
        foreach (ScrapeSourceController::TYPES as $type) {
            DiscoverSites::dispatch(OpportunityType::from($type));
        }
        AuditLog::record($request->user(), 'site.run', 'menjalankan pencarian website peluang');

        return back()->with('success', 'Pencarian website masuk antrean. Hasil muncul dalam beberapa menit.');
    }
}
