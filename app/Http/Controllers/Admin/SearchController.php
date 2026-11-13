<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentReport;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Instant results for the admin header search: a few users, listings and reports matching the term,
 * each linking to its admin page already filtered to that item.
 */
class SearchController extends Controller
{
    private const LIMIT = 5;

    public function __invoke(Request $request): JsonResponse
    {
        $term = trim($request->validate(['q' => ['required', 'string', 'min:2', 'max:100']])['q']);

        $users = User::query()
            ->select(['id', 'name', 'email'])
            // Email prefix uses the unique index; name falls back to a contains match.
            ->where(fn ($q) => $q->where('email', 'like', "{$term}%")->orWhere('name', 'like', "%{$term}%"))
            ->orderBy('name')
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'title' => $user->name,
                'subtitle' => $user->email,
                'href' => route('admin.users.index', ['q' => $user->email], false),
            ]);

        $content = Opportunity::query()
            ->select(['id', 'type', 'title', 'status'])
            ->where('title', 'like', "%{$term}%")
            ->latest()
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (Opportunity $opportunity) => [
                'id' => $opportunity->id,
                'title' => $opportunity->title,
                'subtitle' => $opportunity->type->label().' · '.$opportunity->status->label(),
                'href' => route('admin.moderation.index', ['status' => $opportunity->status->value, 'q' => $opportunity->title], false),
            ]);

        $reports = ContentReport::query()
            ->select(['id', 'opportunity_id', 'reason', 'status'])
            ->with('opportunity:id,title')
            ->where(fn ($q) => $q->where('reason', 'like', "%{$term}%")
                ->orWhereHas('opportunity', fn ($o) => $o->where('title', 'like', "%{$term}%")))
            ->latest()
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (ContentReport $report) => [
                'id' => $report->id,
                'title' => $report->opportunity?->title ?? 'Konten dihapus',
                'subtitle' => $report->reason.' · '.$report->status->label(),
                'href' => route('admin.reports.index', ['status' => $report->status->value, 'q' => $report->opportunity?->title ?? $report->reason], false),
            ]);

        return response()->json(['users' => $users, 'content' => $content, 'reports' => $reports]);
    }
}
