<?php

namespace App\Http\Controllers;

use App\Enums\OpportunityType;
use App\Enums\ReviewStatus;
use App\Models\Opportunity;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LearningController extends Controller
{
    public function index(Request $request): Response
    {
        $courses = DB::table('course_enrollments as e')->join('opportunities as o', 'o.id', '=', 'e.opportunity_id')->where('e.user_id', $request->user()->id)->orderByDesc('e.id')->paginate(12, ['o.id', 'o.title', 'o.summary'])->withQueryString();

        return Inertia::render('learning/index', compact('courses'));
    }

    public function enroll(Request $request, Opportunity $opportunity): RedirectResponse
    {
        abort_unless($opportunity->type === OpportunityType::Course && $opportunity->status === ReviewStatus::Approved && (! $opportunity->deadline || $opportunity->deadline->gte(today())), 404);
        if ($opportunity->getAttribute('organization_id')) {
            abort_unless(Organization::query()->whereKey($opportunity->getAttribute('organization_id'))->where('status', ReviewStatus::Approved)->exists(), 404);
        }
        DB::table('course_enrollments')->insertOrIgnore(['user_id' => $request->user()->id, 'opportunity_id' => $opportunity->id, 'created_at' => now(), 'updated_at' => now()]);

        return to_route('learning.show', $opportunity);
    }

    public function show(Request $request, Opportunity $opportunity): Response
    {
        abort_unless(DB::table('course_enrollments')->where('user_id', $request->user()->id)->where('opportunity_id', $opportunity->id)->exists(), 404);
        $lessons = DB::table('course_lessons as l')->where('opportunity_id', $opportunity->id)->orderBy('l.id')->paginate(12, ['l.id', 'l.title', 'l.source_url', 'l.description'])->withQueryString();
        $completed = DB::table('lesson_progress')->where('user_id', $request->user()->id)->whereIn('lesson_id', DB::table('course_lessons')->where('opportunity_id', $opportunity->id)->select('id'))->pluck('lesson_id');

        return Inertia::render('learning/show', ['course' => $opportunity->only(['id', 'title']), 'lessons' => $lessons, 'completed' => $completed]);
    }

    public function progress(Request $request, Opportunity $opportunity, int $lesson): RedirectResponse
    {
        abort_unless(DB::table('course_enrollments')->where('user_id', $request->user()->id)->where('opportunity_id', $opportunity->id)->exists() && DB::table('course_lessons')->where('opportunity_id', $opportunity->id)->where('id', $lesson)->exists(), 404);
        $data = $request->validate(['completed' => ['required', 'boolean']]);
        if ($data['completed']) {
            DB::table('lesson_progress')->insertOrIgnore(['user_id' => $request->user()->id, 'lesson_id' => $lesson, 'created_at' => now(), 'updated_at' => now()]);
        } else {
            DB::table('lesson_progress')->where('user_id', $request->user()->id)->where('lesson_id', $lesson)->delete();
        }

        return back();
    }

    public function lesson(Request $request, Organization $organization, Opportunity $opportunity): RedirectResponse
    {
        abort_unless($opportunity->getAttribute('organization_id') === $organization->id && $opportunity->type === OpportunityType::Course && DB::table('organization_members')->where('organization_id', $organization->id)->where('user_id', $request->user()->id)->whereIn('permission', ['owner', 'editor'])->exists(), 404);
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'source_url' => ['required', 'url:http,https', 'max:2048'], 'description' => ['nullable', 'string', 'max:5000']], ['required' => 'Judul dan tautan materi wajib diisi.', 'url' => 'Tautan materi harus menggunakan http atau https.', 'max' => 'Isian terlalu panjang.']);
        DB::table('course_lessons')->insert([...$data, 'opportunity_id' => $opportunity->id, 'created_at' => now(), 'updated_at' => now()]);

        return back()->with('success', 'Materi ditambahkan ke kelas.');
    }
}
