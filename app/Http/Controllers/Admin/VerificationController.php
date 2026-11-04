<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewRequest;
use App\Models\AuditLog;
use App\Models\MentorProfile;
use App\Models\Organization;
use App\Models\Role;
use App\Support\AdminStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'tab' => ['nullable', 'in:mitra,mentor'],
            'status' => ['nullable', 'in:menunggu,disetujui,ditolak'],
        ]);

        $tab = $filters['tab'] ?? 'mitra';
        $status = $filters['status'] ?? ReviewStatus::Pending->value;

        // Only the active tab is queried; both use the (status, created_at) index.
        $items = $tab === 'mitra'
            ? Organization::query()
                ->select(['id', 'name', 'type', 'email', 'website', 'description', 'status', 'review_note', 'created_at'])
                ->where('status', $status)
                ->latest()
                ->paginate(10)
                ->withQueryString()
            : MentorProfile::query()
                ->select(['id', 'user_id', 'expertise', 'years_experience', 'bio', 'status', 'review_note', 'created_at'])
                ->with('user:id,name,email')
                ->where('status', $status)
                ->latest()
                ->paginate(10)
                ->withQueryString();

        return Inertia::render('admin/verifications/index', [
            'tab' => $tab,
            'status' => $status,
            'items' => $items,
            'counts' => [
                'mitra' => Organization::query()->pending()->count(),
                'mentor' => MentorProfile::query()->pending()->count(),
            ],
            'statuses' => AdminStats::reviewStatuses(),
        ]);
    }

    public function updateOrganization(ReviewRequest $request, Organization $organization): RedirectResponse
    {
        $organization->review($request->user(), $request->decision(), $request->validated('note'));

        AuditLog::record($request->user(), 'organization.'.$request->decision()->value, $this->describe($request->decision(), 'mitra', $organization->name), $organization);
        AdminStats::flush();

        return back()->with('success', "Mitra {$organization->name} {$request->decision()->label()}.");
    }

    public function updateMentor(ReviewRequest $request, MentorProfile $mentorProfile): RedirectResponse
    {
        $mentorProfile->loadMissing('user:id,name');
        $mentorProfile->review($request->user(), $request->decision(), $request->validated('note'));

        // Verification is what grants the mentor role.
        if ($request->decision() === ReviewStatus::Approved) {
            $mentorProfile->user->assignRole(UserRole::Mentor);
        } else {
            $mentorProfile->user->roles()->detach(Role::idFor(UserRole::Mentor));
        }

        AuditLog::record($request->user(), 'mentor.'.$request->decision()->value, $this->describe($request->decision(), 'mentor', $mentorProfile->user->name), $mentorProfile);
        AdminStats::flush();

        return back()->with('success', "Mentor {$mentorProfile->user->name} {$request->decision()->label()}.");
    }

    private function describe(ReviewStatus $decision, string $kind, string $name): string
    {
        return ($decision === ReviewStatus::Approved ? 'memverifikasi ' : 'menolak verifikasi ')."{$kind} {$name}";
    }
}
