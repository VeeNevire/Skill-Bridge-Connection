<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OpportunityType;
use App\Enums\ReportStatus;
use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewRequest;
use App\Models\AuditLog;
use App\Models\Opportunity;
use App\Support\AdminStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ModerationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(ReviewStatus::class)],
            'type' => ['nullable', Rule::enum(OpportunityType::class)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $status = $filters['status'] ?? ReviewStatus::Pending->value;

        $opportunities = Opportunity::query()
            ->select(['id', 'type', 'title', 'summary', 'details', 'deadline', 'source_url', 'organization_id', 'category_id', 'status', 'review_note', 'created_at'])
            ->with(['organization:id,name', 'category:id,name'])
            ->withCount(['reports as open_reports_count' => fn ($q) => $q->where('status', ReportStatus::Open)])
            ->where('status', $status)
            ->when($filters['type'] ?? null, fn ($q, string $type) => $q->where('type', $type))
            ->when($filters['q'] ?? null, fn ($q, string $term) => $q->where('title', 'like', "%{$term}%"))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/moderation/index', [
            'opportunities' => $opportunities,
            'filters' => [...$filters, 'status' => $status],
            'statuses' => AdminStats::reviewStatuses(),
            'types' => array_map(fn (OpportunityType $t) => ['value' => $t->value, 'label' => $t->label()], OpportunityType::cases()),
        ]);
    }

    public function update(ReviewRequest $request, Opportunity $opportunity): RedirectResponse
    {
        $decision = $request->decision();
        $opportunity->review($request->user(), $decision, $request->validated('note'));

        AuditLog::record(
            $request->user(),
            'opportunity.'.$decision->value,
            ($decision === ReviewStatus::Approved ? 'menyetujui ' : 'menolak ').strtolower($opportunity->type->label())." {$opportunity->title}",
            $opportunity,
        );
        AdminStats::flush();

        return back()->with('success', "\"{$opportunity->title}\" {$decision->label()}.");
    }
}
