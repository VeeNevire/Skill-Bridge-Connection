<?php

namespace App\Http\Controllers;

use App\Enums\OrganizationType;
use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Http\Requests\OrganizationProgramRequest;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\User;
use App\Support\AdminStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationPortalController extends Controller
{
    private const VALIDATION_MESSAGES = ['required' => ':attribute wajib diisi.', 'string' => ':attribute harus berupa teks.', 'max' => ':attribute terlalu panjang.', 'email' => 'Format email tidak valid.', 'url' => 'Tautan harus menggunakan http atau https.', 'date' => 'Tanggal tidak valid.', 'in' => ':attribute tidak valid.', 'integer' => ':attribute harus berupa angka.', 'enum' => 'Jenis organisasi tidak valid.'];

    private const ATTRIBUTE_NAMES = ['name' => 'Nama organisasi', 'type' => 'Jenis organisasi', 'description' => 'Deskripsi', 'email' => 'Email', 'website' => 'Situs resmi', 'permission' => 'Hak akses', 'stage' => 'Tahap', 'interview_at' => 'Jadwal wawancara', 'interview_location' => 'Lokasi wawancara'];

    public function partner(Request $request): Response
    {
        return $this->dashboard($request, false);
    }

    public function company(Request $request): Response
    {
        return $this->dashboard($request, true);
    }

    private function dashboard(Request $request, bool $company): Response
    {
        $filters = $request->validate(['q' => ['nullable', 'string', 'max:100'], 'organization' => ['nullable', 'integer'], 'section' => ['nullable', 'in:overview,programs,jobs,applicants,candidates,interviews,performance,team,organization,company,settings']], self::VALIDATION_MESSAGES, self::ATTRIBUTE_NAMES);
        $organizations = Organization::query()->whereIn('id', DB::table('organization_members')->where('user_id', $request->user()->id)->select('organization_id'))
            ->where('type', $company ? '=' : '!=', OrganizationType::Company)->orderBy('name')->get(['id', 'name', 'type', 'email', 'website', 'description', 'status']);
        $organization = isset($filters['organization']) ? $organizations->firstWhere('id', (int) $filters['organization']) : $organizations->first();
        if (isset($filters['organization']) && $organization === null) {
            abort(404);
        }
        $permission = $organization ? DB::table('organization_members')->where('organization_id', $organization->id)->where('user_id', $request->user()->id)->value('permission') : null;
        $programs = Opportunity::query()->where('organization_id', $organization->id ?? 0)->when($filters['q'] ?? null, fn ($q, $term) => $q->where('title', 'like', '%'.$term.'%'))->orderByDesc('id')->paginate(10, ['id', 'title', 'summary', 'type', 'deadline', 'source_url', 'status', 'review_note', 'accepts_applications', 'details', 'category_id'])->withQueryString();
        // Applicant data (names, emails, messages) is shared with consent, so only owners and reviewers see it.
        $canViewApplicants = in_array($permission, ['owner', 'reviewer'], true);
        $applicationQuery = DB::table('organization_applications as a')->join('opportunities as o', 'o.id', '=', 'a.opportunity_id')->where('o.organization_id', $canViewApplicants ? ($organization->id ?? 0) : 0);
        $counts = (clone $applicationQuery)->selectRaw('a.stage, count(*) as total')->groupBy('a.stage')->pluck('total', 'stage');
        $applications = $applicationQuery->when(($filters['section'] ?? '') === 'interviews', fn ($q) => $q->whereNotNull('a.interview_at'))->join('users as u', 'u.id', '=', 'a.user_id')->orderByDesc('a.id')->paginate(10, ['a.id', 'a.message', 'a.portfolio_url', 'a.stage', 'a.interview_at', 'a.interview_location', 'u.name', 'u.email', 'o.title'], 'applications_page')->withQueryString()->through(function ($application) {
            if ($application->interview_at) {
                $application->interview_at = Carbon::parse($application->interview_at, 'UTC')->toIso8601String();
            }

            return $application;
        });
        $members = DB::table('organization_members as m')->join('users as u', 'u.id', '=', 'm.user_id')->where('m.organization_id', $organization->id ?? 0)->orderBy('m.id')->paginate(10, ['m.id', 'm.permission', 'u.name', 'u.email'], 'members_page')->withQueryString();

        return Inertia::render($company ? 'company/dashboard' : 'partner/dashboard', ['portal' => ['categories' => Category::query()->orderBy('name')->get(['id', 'name']), 'organizations' => $organizations, 'organization' => $organization, 'permission' => $permission, 'programs' => $programs, 'applications' => $applications, 'members' => $members, 'counts' => $counts, 'canViewApplicants' => $canViewApplicants, 'company' => $company, 'section' => $filters['section'] ?? 'overview']]);
    }

    /** @param list<string> $permissions */
    private function authorizeMember(Request $request, Organization $organization, array $permissions): void
    {
        abort_unless(DB::table('organization_members')->where('organization_id', $organization->id)->where('user_id', $request->user()->id)->whereIn('permission', $permissions)->exists(), 404);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'type' => ['required', Rule::enum(OrganizationType::class)], 'email' => ['required', 'email', 'max:255'], 'website' => ['nullable', 'url:http,https', 'max:255'], 'description' => ['required', 'string', 'max:3000']], self::VALIDATION_MESSAGES, self::ATTRIBUTE_NAMES);
        $organization = DB::transaction(function () use ($data, $request) {
            $organization = Organization::query()->create($data);
            DB::table('organization_members')->insert(['organization_id' => $organization->id, 'user_id' => $request->user()->id, 'permission' => 'owner', 'created_at' => now(), 'updated_at' => now()]);
            $request->user()->assignRole($organization->type === OrganizationType::Company ? UserRole::Company : UserRole::Partner);
            AuditLog::record($request->user(), 'organization.created', 'mengajukan verifikasi organisasi', $organization);

            return $organization;
        });
        AdminStats::flush();

        return to_route($organization->type === OrganizationType::Company ? 'company.dashboard' : 'partner.dashboard');
    }

    public function update(Request $request, Organization $organization): RedirectResponse
    {
        $this->authorizeMember($request, $organization, ['owner']);
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255'], 'website' => ['nullable', 'url:http,https', 'max:255'], 'description' => ['required', 'string', 'max:3000']], self::VALIDATION_MESSAGES, self::ATTRIBUTE_NAMES);
        $organization->fill($data);
        if ($organization->isDirty(['name', 'email', 'website'])) {
            $organization->forceFill(['status' => ReviewStatus::Pending, 'reviewed_at' => null, 'reviewed_by' => null]);
            Opportunity::query()->where('organization_id', $organization->id)->update(['status' => ReviewStatus::Pending->value]);
        }
        $organization->save();
        AuditLog::record($request->user(), 'organization.updated', 'memperbarui organisasi', $organization);
        AdminStats::flush();

        return back()->with('success', 'Profil organisasi disimpan. Perubahan identitas memerlukan verifikasi ulang.');
    }

    public function program(OrganizationProgramRequest $request, Organization $organization, ?Opportunity $opportunity = null): RedirectResponse
    {
        $data = $request->validated();
        if ($opportunity) {
            abort_unless($opportunity->getAttribute('organization_id') === $organization->id, 404);
            if ($opportunity->type->value !== $data['type']) {
                throw ValidationException::withMessages(['type' => 'Jenis program yang sudah dibuat tidak dapat diubah.']);
            }
        } else {
            $opportunity = new Opportunity;
        }
        $details = $opportunity->details ?? [];
        foreach (['level' => 'jenjang', 'location' => 'lokasi', 'duration' => 'durasi', 'work_type' => 'tipe_kerja', 'requirements' => 'persyaratan'] as $field => $key) {
            if (array_key_exists($field, $data)) {
                $details[$field === 'level' && $data['type'] === 'kelas' ? 'level' : $key] = $data[$field];
            }
        }
        $opportunity->fill(Arr::except($data, ['level', 'location', 'duration', 'work_type', 'requirements']))->forceFill(['details' => $details, 'organization_id' => $organization->id, 'status' => ReviewStatus::Pending, 'reviewed_at' => null, 'reviewed_by' => null, 'review_note' => null])->save();
        AuditLog::record($request->user(), 'opportunity.submitted', 'mengajukan program untuk moderasi', $opportunity);
        AdminStats::flush();

        return back()->with('success', 'Program dikirim ke moderasi admin.');
    }

    public function close(Request $request, Organization $organization, Opportunity $opportunity): RedirectResponse
    {
        $this->authorizeMember($request, $organization, ['owner', 'editor']);
        abort_unless($opportunity->getAttribute('organization_id') === $organization->id, 404);
        $opportunity->update(['deadline' => today()->subDay()]);
        AuditLog::record($request->user(), 'opportunity.closed', 'menutup pendaftaran program', $opportunity);
        AdminStats::flush();

        return back()->with('success', 'Pendaftaran program ditutup.');
    }

    public function member(Request $request, Organization $organization): RedirectResponse
    {
        $this->authorizeMember($request, $organization, ['owner']);
        $data = $request->validate(['email' => ['required', 'email'], 'permission' => ['required', 'in:editor,reviewer']], self::VALIDATION_MESSAGES, self::ATTRIBUTE_NAMES);
        $user = User::query()->where('email', $data['email'])->whereNull('suspended_at')->first();
        if (! $user) {
            throw ValidationException::withMessages(['email' => 'Akun aktif dengan email ini belum ditemukan.']);
        }
        DB::transaction(function () use ($request, $organization, $user, $data) {
            DB::table('organization_members')->insertOrIgnore(['organization_id' => $organization->id, 'user_id' => $user->id, 'permission' => $data['permission'], 'created_at' => now(), 'updated_at' => now()]);
            $user->assignRole($organization->type === OrganizationType::Company ? UserRole::Company : UserRole::Partner);
            AuditLog::record($request->user(), 'organization.member.added', 'menambahkan anggota organisasi', $organization, ['member_id' => $user->id]);
        });
        AdminStats::flush();

        return back()->with('success', 'Anggota ditambahkan.');
    }

    public function removeMember(Request $request, Organization $organization, int $member): RedirectResponse
    {
        $this->authorizeMember($request, $organization, ['owner']);
        $record = DB::table('organization_members')->where('organization_id', $organization->id)->where('id', $member)->where('permission', '!=', 'owner')->first();
        abort_unless($record !== null, 404);
        DB::table('organization_members')->where('id', $record->id)->delete();
        AuditLog::record($request->user(), 'organization.member.removed', 'menghapus akses anggota organisasi', $organization, ['member_id' => $record->user_id]);

        return back()->with('success', 'Akses organisasi dicabut.');
    }

    public function candidate(Request $request, Organization $organization, int $application): RedirectResponse
    {
        $this->authorizeMember($request, $organization, ['owner', 'reviewer']);
        $query = DB::table('organization_applications')->where('id', $application)->whereIn('opportunity_id', Opportunity::query()->where('organization_id', $organization->id)->select('id'));
        abort_unless((clone $query)->exists(), 404);
        $data = $request->validate(['stage' => ['required', 'in:baru,ditinjau,wawancara,diterima,ditolak'], 'interview_at' => ['nullable', 'date'], 'interview_location' => ['nullable', 'string', 'max:255']], self::VALIDATION_MESSAGES, self::ATTRIBUTE_NAMES);
        if (! empty($data['interview_at'])) {
            $data['interview_at'] = Carbon::parse($data['interview_at'])->utc()->toDateTimeString();
        }
        $query->update([...$data, 'updated_at' => now()]);
        AuditLog::record($request->user(), 'organization.application.updated', 'memperbarui tahap pendaftar', $organization, ['application_id' => $application, 'stage' => $data['stage']]);

        return back()->with('success', 'Tahap pendaftar diperbarui.');
    }
}
