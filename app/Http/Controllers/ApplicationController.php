<?php

namespace App\Http\Controllers;

use App\Enums\ReviewStatus;
use App\Models\Application;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\PrivateDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate(['q' => ['nullable', 'string', 'max:100']]);
        $applications = Application::query()->where('user_id', $request->user()->id)
            ->when($filters['q'] ?? null, fn ($query, $term) => $query->whereHas('opportunity', fn ($q) => $q->where('title', 'like', '%'.$term.'%')))
            ->with(['opportunity:id,title,type,deadline,source_url', 'tasks:id,application_id,title,completed,due_date'])
            ->latest('updated_at')->latest('id')->paginate(10)->withQueryString();

        return Inertia::render('applications/index', ['applications' => $applications, 'submissions' => DB::table('organization_applications as a')->join('opportunities as o', 'o.id', '=', 'a.opportunity_id')->where('a.user_id', $request->user()->id)->orderByDesc('a.id')->paginate(10, ['a.id', 'a.stage', 'a.interview_at', 'a.interview_location', 'o.title'], 'submissions_page')->withQueryString()->through(function ($application) {
            if ($application->interview_at) {
                $application->interview_at = Carbon::parse($application->interview_at, 'UTC')->toIso8601String();
            }

            return $application;
        })]);
    }

    public function store(Request $request, Opportunity $opportunity): RedirectResponse
    {
        abort_unless($opportunity->status === ReviewStatus::Approved && (! $opportunity->deadline || $opportunity->deadline->isToday() || $opportunity->deadline->isFuture()), 404);
        if ($opportunity->getAttribute('organization_id')) {
            abort_unless(Organization::query()->whereKey($opportunity->getAttribute('organization_id'))->where('status', ReviewStatus::Approved)->exists(), 404);
        }
        $application = Application::query()->firstOrCreate(['user_id' => $request->user()->id, 'opportunity_id' => $opportunity->id]);
        if ($application->wasRecentlyCreated) {
            $requirements = $opportunity->details['persyaratan'] ?? '';
            foreach (array_slice(preg_split('/\r?\n/', is_string($requirements) ? $requirements : '') ?: [], 0, 30) as $title) {
                if (trim($title) !== '') {
                    $application->tasks()->create(['title' => Str::limit(trim($title), 255, ''), 'due_date' => $opportunity->deadline]);
                }
            }
        }

        return to_route('applications.index')->with('success', 'Peluang disimpan ke pelacak Anda.');
    }

    public function update(Request $request, Application $application): RedirectResponse
    {
        abort_unless($application->getAttribute('user_id') === $request->user()->id, 404);
        $data = $request->validate(['status' => ['required', Rule::in(['ingin_daftar', 'persiapan', 'dikirim', 'seleksi', 'diterima', 'tidak_lolos'])], 'notes' => ['nullable', 'string', 'max:5000']], ['status.required' => 'Status wajib dipilih.', 'status.in' => 'Status tidak valid.', 'notes.max' => 'Catatan maksimal 5000 karakter.']);
        $application->update($data);

        return back()->with('success', 'Catatan aplikasi disimpan.');
    }

    public function destroy(Request $request, Application $application): RedirectResponse
    {
        abort_unless($application->getAttribute('user_id') === $request->user()->id, 404);
        $paths = PrivateDocument::query()->where('application_id', $application->id)->where('user_id', $request->user()->id)->pluck('path')->all();
        $application->delete();
        Storage::disk('local')->delete($paths);

        return back()->with('success', 'Peluang dihapus dari pelacak.');
    }
}
