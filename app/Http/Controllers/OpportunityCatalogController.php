<?php

namespace App\Http\Controllers;

use App\Enums\OpportunityType;
use App\Enums\ReviewStatus;
use App\Models\Category;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpportunityCatalogController extends Controller
{
    public function index(Request $request, string $type): Response
    {
        abort_unless(in_array($type, array_column(OpportunityType::cases(), 'value'), true), 404);
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'organizer' => ['nullable', 'string', 'max:100'],
            'deadline_before' => ['nullable', 'date'],
            'work_type' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'integer', 'min:1'],
            'level' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:100'],
        ]);
        $opportunities = Opportunity::query()
            ->select(['id', 'title', 'summary', 'details', 'deadline', 'source_url', 'organization_id', 'category_id'])
            ->with(['organization:id,name', 'category:id,name'])
            ->where('type', $type)->where('status', ReviewStatus::Approved)
            ->where(fn ($q) => $q->whereNull('organization_id')->orWhereHas('organization', fn ($org) => $org->where('status', ReviewStatus::Approved)))
            ->where(fn ($q) => $q->whereNull('deadline')->orWhereDate('deadline', '>=', today()))
            ->when($filters['q'] ?? null, fn ($q, string $term) => $q->where('title', 'like', "%{$term}%"))
            ->when($filters['category'] ?? null, fn ($q, $category) => $q->where('category_id', $category))
            ->when($filters['level'] ?? null, fn ($q, string $level) => $q->where($type === 'kelas' ? 'details->level' : 'details->jenjang', $level))
            ->when($filters['location'] ?? null, fn ($q, string $location) => $q->where('details->lokasi', $location))
            ->when($filters['organizer'] ?? null, fn ($q, string $organizer) => $q->whereHas('organization', fn ($organization) => $organization->where('name', 'like', '%'.$organizer.'%')))
            ->when($filters['deadline_before'] ?? null, fn ($q, $deadline) => $q->whereDate('deadline', '<=', $deadline))
            ->when($filters['work_type'] ?? null, fn ($q, $workType) => $q->where('details->tipe_kerja', $workType))
            ->orderByDesc('created_at')->orderByDesc('id')->paginate(12)->withQueryString();

        return Inertia::render('catalog/index', [
            'opportunities' => $opportunities,
            'filters' => $filters,
            'type' => $type,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }
}
