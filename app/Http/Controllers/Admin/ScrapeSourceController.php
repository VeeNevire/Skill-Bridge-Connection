<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OpportunityType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ScrapeSourceRequest;
use App\Jobs\RunScraper;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Opportunity;
use App\Models\ScrapeSource;
use App\Services\HermesClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/** One admin page per menu (Beasiswa, Magang, Karier): its scraper sources plus the admin-managed listings. */
class ScrapeSourceController extends Controller
{
    public const TYPES = ['beasiswa', 'magang', 'lowongan'];

    public function index(Request $request, string $type): Response
    {
        $filters = $request->validate(['q' => ['nullable', 'string', 'max:100'], 'per_page' => ['nullable', 'integer', 'in:10,25,50']]);
        $q = $filters['q'] ?? null;

        return Inertia::render('admin/scrapers/index', [
            'type' => $type,
            'sources' => ScrapeSource::query()->where('type', $type)->withCount('opportunities')->orderBy('name')->get()
                ->each(fn (ScrapeSource $source) => $source->setAttribute('schedule_label', $source->scheduleLabel())),
            // Partner submissions live in moderation; this list only holds scraped and hand-entered rows.
            'opportunities' => Opportunity::query()
                ->select(['id', 'title', 'summary', 'details', 'deadline', 'source_url', 'category_id', 'scrape_source_id', 'created_at'])
                ->with('scrapeSource:id,name')
                ->where('type', $type)->whereNull('organization_id')
                ->when($q, fn ($query, string $term) => $query->where('title', 'like', "%{$term}%"))
                ->latest('id')->paginate($filters['per_page'] ?? 10)->withQueryString(),
            'filters' => ['q' => $q, 'per_page' => $filters['per_page'] ?? null],
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(ScrapeSourceRequest $request, string $type): RedirectResponse
    {
        $source = ScrapeSource::query()->create([...$request->validated(), 'type' => OpportunityType::from($type)]);
        AuditLog::record($request->user(), 'scraper.created', "menambah sumber scraper {$source->name}", $source);

        return back()->with('success', "Sumber {$source->name} ditambahkan.");
    }

    public function update(ScrapeSourceRequest $request, ScrapeSource $scrapeSource): RedirectResponse
    {
        $scrapeSource->update($request->validated());
        AuditLog::record($request->user(), 'scraper.updated', "mengubah sumber scraper {$scrapeSource->name}", $scrapeSource);

        return back()->with('success', "Sumber {$scrapeSource->name} diperbarui.");
    }

    public function destroy(Request $request, ScrapeSource $scrapeSource): RedirectResponse
    {
        // Scraped opportunities are removed with their source by the foreign key.
        $scrapeSource->delete();
        AuditLog::record($request->user(), 'scraper.deleted', "menghapus sumber scraper {$scrapeSource->name}");

        return back()->with('success', "Sumber {$scrapeSource->name} dihapus.");
    }

    public function run(Request $request, ScrapeSource $scrapeSource): RedirectResponse
    {
        RunScraper::dispatch($scrapeSource);
        AuditLog::record($request->user(), 'scraper.run', "menjalankan scraper {$scrapeSource->name}", $scrapeSource);

        return back()->with('success', "Scraper {$scrapeSource->name} masuk antrean.");
    }

    public function preview(ScrapeSource $scrapeSource, HermesClient $hermes): JsonResponse
    {
        set_time_limit(0);
        try {
            return response()->json(['items' => array_slice(RunScraper::scrape($scrapeSource, $hermes), 0, 5)]);
        } catch (Throwable $e) {
            return response()->json(['message' => str($e->getMessage())->limit(300)->toString()], 422);
        }
    }
}
