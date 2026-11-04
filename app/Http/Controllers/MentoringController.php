<?php

namespace App\Http\Controllers;

use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Http\Requests\StoreMentoringRequest;
use App\Models\AuditLog;
use App\Models\MentoringRequest;
use App\Models\MentorProfile;
use App\Models\User;
use App\Support\AdminStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MentoringController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate(['q' => ['nullable', 'string', 'max:100']]);
        $mentors = MentorProfile::query()->where('user_id', '!=', $request->user()->id)->where('status', ReviewStatus::Approved)
            ->when($filters['q'] ?? null, fn ($query, $term) => $query->where(fn ($q) => $q->where('expertise', 'like', '%'.$term.'%')->orWhereHas('user', fn ($user) => $user->where('name', 'like', '%'.$term.'%'))))
            ->whereHas('user', fn ($q) => $q->withRole(UserRole::Mentor)->whereNull('suspended_at'))
            ->with(['user:id,name', 'availability' => fn ($q) => $q->select(['id', 'mentor_id', 'starts_at', 'duration'])->where('starts_at', '>', now())->whereNotExists(fn ($query) => $query->selectRaw('1')->from('mentoring_requests')->whereColumn('availability_id', 'mentor_availability.id'))->orderBy('starts_at')->limit(6)])->select(['id', 'user_id', 'expertise', 'bio', 'years_experience'])
            ->orderBy('id')->paginate(8, ['*'], 'mentors_page')->withQueryString();
        $slots = $mentors->getCollection()->flatMap(fn (MentorProfile $profile) => $profile->availability)->values();
        $mentors->getCollection()->each(fn (MentorProfile $profile) => $profile->unsetRelation('availability'));
        $sessions = MentoringRequest::query()->where('participant_id', $request->user()->id)->with('mentor:id,name')->latest('starts_at')->paginate(10, ['*'], 'sessions_page')->withQueryString();

        return Inertia::render('mentoring/index', [...compact('mentors', 'slots', 'sessions'), 'myProfile' => MentorProfile::query()->where('user_id', $request->user()->id)->first(['expertise', 'bio', 'years_experience', 'status'])]);
    }

    public function dashboard(Request $request): Response
    {
        $filters = $request->validate(['q' => ['nullable', 'string', 'max:100'], 'section' => ['nullable', 'in:overview,requests,schedule,mentees,notes,feedback,profile,settings']]);
        $section = $filters['section'] ?? 'overview';
        $sessions = MentoringRequest::query()->where('mentor_id', $request->user()->id)
            ->when($filters['q'] ?? null, fn ($query, $term) => $query->where(fn ($q) => $q->where('topic', 'like', '%'.$term.'%')->orWhereHas('participant', fn ($user) => $user->where('name', 'like', '%'.$term.'%'))))
            ->when($section === 'requests', fn ($q) => $q->where('status', 'menunggu'))
            ->when(in_array($section, ['schedule', 'mentees', 'notes'], true), fn ($q) => $q->whereIn('status', ['diterima', 'selesai']))
            ->when($section === 'feedback', fn ($q) => $q->whereNotNull('rating'))
            ->with('participant:id,name')->latest('starts_at')->paginate(12)->withQueryString()->through(fn (MentoringRequest $session) => $session->makeVisible('private_note'));
        $slots = DB::table('mentor_availability as s')->select(['s.id', 's.starts_at', 's.duration'])->selectSub(DB::table('mentoring_requests')->selectRaw('count(*)')->whereColumn('availability_id', 's.id'), 'reservations')->where('s.mentor_id', $request->user()->id)->orderBy('s.starts_at')->paginate(12, ['*'], 'slots_page')->withQueryString()->through(function ($slot) {
            $slot->starts_at = Carbon::parse($slot->starts_at, 'UTC')->toIso8601String();

            return $slot;
        });
        $profile = MentorProfile::query()->where('user_id', $request->user()->id)->first(['expertise', 'bio', 'years_experience', 'status']);

        return Inertia::render('mentor/dashboard', compact('sessions', 'slots', 'profile', 'section'));
    }

    public function store(StoreMentoringRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $slot = DB::table('mentor_availability')->where('id', $request->integer('availability_id'))->lockForUpdate()->first();
            if (! $slot || $slot->starts_at <= now()->toDateTimeString() || $slot->mentor_id === $request->user()->id || DB::table('mentoring_requests')->where('availability_id', $slot->id)->exists()) {
                throw ValidationException::withMessages(['availability_id' => 'Jadwal sudah tidak tersedia. Pilih jadwal lain.']);
            }
            abort_unless(MentorProfile::query()->where('user_id', $slot->mentor_id)->where('status', ReviewStatus::Approved)->whereHas('user', fn ($q) => $q->withRole(UserRole::Mentor)->whereNull('suspended_at'))->exists(), 404);
            $session = new MentoringRequest($request->safe()->only(['topic', 'goal']));
            $session->forceFill(['participant_id' => $request->user()->id, 'mentor_id' => $slot->mentor_id, 'availability_id' => $slot->id, 'starts_at' => $slot->starts_at])->save();
            AuditLog::record($request->user(), 'mentoring.requested', 'mengajukan sesi mentoring', $session);
        });

        return back()->with('success', 'Permintaan sesi dikirim ke mentor.');
    }

    public function update(Request $request, MentoringRequest $session): RedirectResponse
    {
        abort_unless($session->getAttribute('mentor_id') === $request->user()->id, 404);
        $data = $request->validate(['status' => ['required', 'in:diterima,ditolak,selesai'], 'shared_note' => ['nullable', 'string', 'max:5000'], 'private_note' => ['nullable', 'string', 'max:5000']], ['required' => 'Status wajib dipilih.', 'in' => 'Status tidak valid.', 'max' => 'Catatan maksimal 5000 karakter.']);
        DB::transaction(function () use ($request, $session, $data) {
            $locked = MentoringRequest::query()->whereKey($session->id)->lockForUpdate()->firstOrFail();
            $current = $locked->getAttribute('status');
            $next = $data['status'];
            if (($current === 'menunggu' && ! in_array($next, ['diterima', 'ditolak'], true)) || ($current === 'diterima' && ! in_array($next, ['diterima', 'selesai'], true)) || ($current === 'ditolak') || ($current === 'selesai' && $next !== 'selesai') || ($next === 'selesai' && $locked->getAttribute('starts_at')->isFuture())) {
                throw ValidationException::withMessages(['status' => 'Perubahan status sesi tidak diperbolehkan.']);
            }
            $locked->fill($data);
            if ($next === 'ditolak') {
                $locked->setAttribute('availability_id', null);
            }
            $locked->save();
            AuditLog::record($request->user(), 'mentoring.updated', 'memperbarui sesi mentoring', $locked, ['status' => $next]);
        });

        return back()->with('success', 'Sesi mentoring diperbarui.');
    }

    public function feedback(Request $request, MentoringRequest $session): RedirectResponse
    {
        abort_unless($session->getAttribute('participant_id') === $request->user()->id && $session->getAttribute('status') === 'selesai', 404);
        $session->update($request->validate(['rating' => ['required', 'integer', 'between:1,5'], 'feedback' => ['required', 'string', 'max:2000']], ['required' => 'Penilaian dan umpan balik wajib diisi.', 'between' => 'Penilaian harus antara 1 dan 5.', 'max' => 'Umpan balik maksimal 2000 karakter.']));

        return back()->with('success', 'Umpan balik disimpan.');
    }

    public function availability(Request $request): RedirectResponse
    {
        $data = $request->validate(['starts_at' => ['required', 'date', 'after:now'], 'duration' => ['required', 'integer', 'in:30,60,90']], ['required' => 'Jadwal dan durasi wajib diisi.', 'after' => 'Jadwal harus di masa mendatang.', 'date' => 'Tanggal tidak valid.', 'in' => 'Durasi tidak valid.']);
        DB::transaction(function () use ($request, $data) {
            User::query()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $start = Carbon::parse($data['starts_at'])->utc();
            $end = $start->copy()->addMinutes((int) $data['duration']);
            $nearby = DB::table('mentor_availability')->where('mentor_id', $request->user()->id)->whereBetween('starts_at', [$start->copy()->subMinutes(90), $end])->get(['starts_at', 'duration']);
            foreach ($nearby as $slot) {
                $otherStart = Carbon::parse($slot->starts_at, 'UTC');
                if ($start->lt($otherStart->copy()->addMinutes($slot->duration)) && $end->gt($otherStart)) {
                    throw ValidationException::withMessages(['starts_at' => 'Jadwal bertumpang tindih dengan jadwal yang sudah ada.']);
                }
            }
            DB::table('mentor_availability')->insert(['mentor_id' => $request->user()->id, 'starts_at' => $start->toDateTimeString(), 'duration' => $data['duration'], 'created_at' => now(), 'updated_at' => now()]);
        });

        return back()->with('success', 'Jadwal tersedia ditambahkan.');
    }

    public function removeAvailability(Request $request, int $slot): RedirectResponse
    {
        DB::transaction(function () use ($request, $slot) {
            $record = DB::table('mentor_availability')->where('id', $slot)->where('mentor_id', $request->user()->id)->lockForUpdate()->first();
            abort_unless($record !== null && ! DB::table('mentoring_requests')->where('availability_id', $slot)->exists(), 404);
            DB::table('mentor_availability')->where('id', $slot)->delete();
        });

        return back()->with('success', 'Jadwal tersedia dihapus.');
    }

    public function profile(Request $request): RedirectResponse
    {
        $data = $request->validate(['expertise' => ['required', 'string', 'max:255'], 'bio' => ['nullable', 'string', 'max:2000'], 'years_experience' => ['required', 'integer', 'between:0,80']], ['required' => 'Bidang keahlian dan pengalaman wajib diisi.', 'max' => 'Isian terlalu panjang.', 'between' => 'Pengalaman harus antara 0 dan 80 tahun.']);
        $profile = MentorProfile::query()->firstOrNew(['user_id' => $request->user()->id]);
        $profile->forceFill(['user_id' => $request->user()->id])->fill($data);

        // A rejected applicant who updates their profile is re-submitted to the verification queue.
        if ($profile->status === ReviewStatus::Rejected) {
            $profile->forceFill(['status' => ReviewStatus::Pending, 'reviewed_by' => null, 'reviewed_at' => null, 'review_note' => null]);
        }

        $profile->save();
        AuditLog::record($request->user(), 'mentor.profile.updated', 'memperbarui profil mentor', $profile);
        AdminStats::flush();

        return back()->with('success', $profile->status === ReviewStatus::Approved ? 'Profil mentor diperbarui.' : 'Profil mentor disimpan dan menunggu verifikasi admin.');
    }
}
