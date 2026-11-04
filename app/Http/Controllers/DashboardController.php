<?php

namespace App\Http\Controllers;

use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Models\Application;
use App\Models\MentoringRequest;
use App\Models\Opportunity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the participant dashboard; accounts without that role go to their own dashboard.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->hasRole(UserRole::Participant)) {
            return redirect()->route($request->user()->homeRoute());
        }

        $id = $request->user()->id;
        $preferences = DB::table('talent_profiles')->where('user_id', $id)->first(['preferred_opportunity', 'preferred_location', 'preferred_level']);
        $recommendations = Opportunity::query()->where('status', ReviewStatus::Approved)
            ->where(fn ($q) => $q->whereNull('deadline')->orWhereDate('deadline', '>=', today()))
            ->where(fn ($q) => $q->whereNull('organization_id')->orWhereHas('organization', fn ($org) => $org->where('status', ReviewStatus::Approved)))
            ->when($preferences->preferred_opportunity ?? null, fn ($q, $type) => $q->where('type', $type))
            ->when($preferences->preferred_location ?? null, fn ($q, $location) => $q->where('details->lokasi', $location))
            ->latest('id')->limit(4)->get(['id', 'title', 'summary']);
        $recommendationReason = ($preferences->preferred_opportunity ?? null) || ($preferences->preferred_location ?? null) ? 'Disaring menggunakan preferensi yang sudah diisi di Talent Passport.' : 'Peluang terbaru yang sudah disetujui. Isi preferensi Talent Passport untuk menyaring pilihan.';

        return Inertia::render('dashboard', ['overview' => [
            'recommendations' => $recommendations,
            'recommendationReason' => $recommendationReason,
            'applications' => Application::query()->where('user_id', $id)->count(),
            'courses' => DB::table('course_enrollments')->where('user_id', $id)->count(),
            'sessions' => MentoringRequest::query()->where('participant_id', $id)->where('status', 'diterima')->count(),
            'recent' => Application::query()->where('user_id', $id)->with('opportunity:id,title,type,deadline')->latest('updated_at')->limit(5)->get(['id', 'opportunity_id', 'status']),
            'deadlines' => DB::table('application_tasks as t')->join('applications as a', 'a.id', '=', 't.application_id')->where('a.user_id', $id)->where('t.completed', false)->whereNotNull('t.due_date')->orderBy('t.due_date')->limit(5)->get(['t.id', 't.title', 't.due_date']),
            'nextSession' => MentoringRequest::query()->where('participant_id', $id)->where('status', 'diterima')->where('starts_at', '>=', now())->with('mentor:id,name')->orderBy('starts_at')->first(['id', 'mentor_id', 'topic', 'starts_at']),
        ]]);
    }
}
