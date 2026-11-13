<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportStatus;
use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ContentReport;
use App\Models\MentorProfile;
use App\Models\Organization;
use App\Support\AdminStats;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Every figure here is a grouped aggregate; the whole set is cached for ten minutes.
     * Only plain arrays go in the cache: objects come back as __PHP_Incomplete_Class
     * because config/cache.php disallows unserializing classes.
     */
    public function __invoke(): Response
    {
        $extra = Cache::remember('admin.analytics.extra', 600, fn () => [
            'reportsByStatus' => ContentReport::query()->toBase()
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status')
                ->map(fn ($n) => (int) $n)
                ->all(),
            'verifiedPartners' => Organization::query()->where('status', ReviewStatus::Approved)->count(),
            'verifiedMentors' => MentorProfile::query()->where('status', ReviewStatus::Approved)->count(),
            'topCategories' => Category::query()
                ->select(['id', 'name'])
                ->withCount('opportunities')
                ->orderByDesc('opportunities_count')
                ->limit(6)
                ->get()
                ->toArray(),
            'openReports' => ContentReport::query()->where('status', ReportStatus::Open)->count(),
        ]);

        return Inertia::render('admin/analytics', [
            'userStats' => AdminStats::users(),
            'signups' => AdminStats::signups(30),
            'opportunities' => AdminStats::opportunityBreakdown(),
            ...$extra,
        ]);
    }
}
