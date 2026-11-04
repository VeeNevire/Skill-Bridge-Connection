<?php

use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Models\MentoringRequest;
use App\Models\MentorProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('participant request reaches mentor and shared notes return without private notes', function () {
    $mentor = User::factory()->withRoles(UserRole::Mentor)->create();
    MentorProfile::factory()->create(['user_id' => $mentor->id, 'status' => ReviewStatus::Approved]);
    $participant = User::factory()->create();
    $this->actingAs($mentor)->post(route('mentoring.availability'), ['starts_at' => now()->addDays(2)->toDateTimeString(), 'duration' => 60])->assertSessionHasNoErrors();
    $slot = DB::table('mentor_availability')->first();
    $this->actingAs($participant)->get(route('mentoring.index'))->assertInertia(fn (Assert $page) => $page->has('mentors.data', 1)->has('slots', 1));
    $this->actingAs($participant)->post(route('mentoring.store'), ['availability_id' => $slot->id, 'topic' => 'Esai', 'goal' => 'Review struktur'])->assertSessionHasNoErrors();
    $session = MentoringRequest::query()->firstOrFail();
    $this->actingAs($mentor)->get(route('mentor.dashboard'))->assertInertia(fn (Assert $page) => $page->where('sessions.data.0.topic', 'Esai'));
    $this->actingAs($mentor)->patch(route('mentoring.update', $session), ['status' => 'diterima', 'shared_note' => 'Perbaiki struktur', 'private_note' => 'Rahasia mentor'])->assertSessionHasNoErrors();
    $this->actingAs($participant)->get(route('mentoring.index'))->assertInertia(fn (Assert $page) => $page->where('sessions.data.0.status', 'diterima')->where('sessions.data.0.shared_note', 'Perbaiki struktur')->missing('sessions.data.0.private_note'));
    $this->actingAs($participant)->post(route('mentoring.store'), ['availability_id' => $slot->id, 'topic' => 'Esai', 'goal' => 'Lagi'])->assertSessionHasErrors('availability_id');
});

test('mentoring rejects unrelated users and premature feedback', function () {
    $mentor = User::factory()->withRoles(UserRole::Mentor)->create();
    $participant = User::factory()->create();
    $other = User::factory()->withRoles(UserRole::Participant, UserRole::Mentor)->create();
    $session = new MentoringRequest(['topic' => 'Esai', 'goal' => 'Review']);
    $session->forceFill(['participant_id' => $participant->id, 'mentor_id' => $mentor->id, 'starts_at' => now()->subDay()])->save();
    $this->actingAs($other)->patch(route('mentoring.update', $session), ['status' => 'diterima'])->assertNotFound();
    $this->actingAs($other)->patch(route('mentoring.feedback', $session), ['rating' => 5, 'feedback' => 'Bagus'])->assertNotFound();
    $this->actingAs($participant)->patch(route('mentoring.feedback', $session), ['rating' => 5, 'feedback' => 'Bagus'])->assertNotFound();
    $this->actingAs($mentor)->patch(route('mentoring.update', $session), ['status' => 'diterima']);
    $this->actingAs($mentor)->patch(route('mentoring.update', $session), ['status' => 'selesai'])->assertSessionHasNoErrors();
    $this->actingAs($participant)->patch(route('mentoring.feedback', $session), ['rating' => 5, 'feedback' => 'Bagus'])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('mentoring_requests', ['id' => $session->id, 'rating' => 5]);
});

test('participant can submit a profile for admin verification', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('mentoring.profile'), ['expertise' => 'Karier', 'bio' => 'Mentor', 'years_experience' => 3])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('mentor_profiles', ['user_id' => $user->id, 'status' => 'menunggu']);
    expect($user->fresh()->hasRole(UserRole::Mentor))->toBeFalse();
});

test('mentor cannot publish overlapping slots or delete reserved availability', function () {
    $mentor = User::factory()->withRoles(UserRole::Mentor)->create();
    $start = now()->addDays(3)->startOfHour();
    $this->actingAs($mentor)->post(route('mentoring.availability'), ['starts_at' => $start->toISOString(), 'duration' => 60])->assertSessionHasNoErrors();
    $this->actingAs($mentor)->post(route('mentoring.availability'), ['starts_at' => $start->copy()->addMinutes(30)->toISOString(), 'duration' => 60])->assertSessionHasErrors('starts_at');
    $slot = DB::table('mentor_availability')->first();
    $participant = User::factory()->create();
    $session = new MentoringRequest(['topic' => 'Review', 'goal' => 'Belajar']);
    $session->forceFill(['participant_id' => $participant->id, 'mentor_id' => $mentor->id, 'availability_id' => $slot->id, 'starts_at' => $start])->save();
    $this->actingAs($mentor)->delete(route('mentoring.remove-availability', $slot->id))->assertNotFound();
    $this->actingAs($mentor)->patch(route('mentoring.update', $session), ['status' => 'ditolak'])->assertSessionHasNoErrors();
    $this->actingAs($mentor)->delete(route('mentoring.remove-availability', $slot->id))->assertRedirect();
});

test('a rejected mentor applicant can update their profile and re-enter the verification queue', function () {
    $applicant = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $this->actingAs($applicant)->post(route('mentoring.profile'), ['expertise' => 'Esai beasiswa', 'years_experience' => 2])->assertSessionHasNoErrors();
    $profile = MentorProfile::query()->where('user_id', $applicant->id)->firstOrFail();
    $this->actingAs($admin)->patch(route('admin.verifications.mentors.update', $profile), ['decision' => 'ditolak', 'note' => 'Lengkapi pengalaman'])->assertSessionHasNoErrors();

    $this->actingAs($applicant)->post(route('mentoring.profile'), ['expertise' => 'Esai beasiswa', 'years_experience' => 4, 'bio' => 'Sudah membimbing 20 penerima beasiswa'])->assertSessionHasNoErrors();

    expect($profile->fresh())
        ->status->toBe(ReviewStatus::Pending)
        ->review_note->toBeNull();
});
