<?php

use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Models\Application;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

function registerOrganization(User $owner): Organization
{
    test()->actingAs($owner)->post(route('organizations.store'), ['name' => 'Yayasan Pendidikan', 'type' => 'yayasan', 'email' => 'org@example.com', 'website' => 'https://example.com', 'description' => 'Program pendidikan'])->assertSessionHasNoErrors();

    return Organization::query()->latest('id')->firstOrFail();
}
function programPayload(string $type = 'beasiswa'): array
{
    return ['title' => 'Peluang Pendidikan', 'type' => $type, 'summary' => 'Persyaratan lengkap', 'deadline' => now()->addMonth()->toDateString(), 'source_url' => 'https://example.com/daftar', 'accepts_applications' => true];
}

test('organization program passes moderation before participant applies and sees organization decisions', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $participant = User::factory()->create();
    $organization = registerOrganization($owner);
    $this->actingAs($owner)->post(route('organizations.program', $organization), programPayload())->assertForbidden();
    $this->actingAs($admin)->patch(route('admin.verifications.organizations.update', $organization), ['decision' => 'disetujui'])->assertSessionHasNoErrors();
    $this->actingAs($owner)->post(route('organizations.program', $organization), programPayload())->assertSessionHasNoErrors();
    $program = Opportunity::query()->latest('id')->firstOrFail();
    $this->get(route('catalog.show', $program))->assertNotFound();
    $this->actingAs($admin)->patch(route('admin.moderation.update', $program), ['decision' => 'disetujui'])->assertSessionHasNoErrors();
    $this->get(route('catalog.show', $program))->assertOk();
    $this->actingAs($participant)->post(route('catalog.apply', $program), ['message' => 'Saya ingin mendaftar', 'consent' => false])->assertSessionHasErrors('consent');
    expect(DB::table('organization_applications')->count())->toBe(0);
    $this->actingAs($participant)->post(route('catalog.apply', $program), ['message' => 'Saya ingin mendaftar', 'consent' => true])->assertRedirect(route('applications.index'));
    $application = DB::table('organization_applications')->first();
    $this->actingAs($owner)->get(route('partner.dashboard'))->assertInertia(fn (Assert $page) => $page->where('portal.applications.data.0.message', 'Saya ingin mendaftar'));
    $this->actingAs($owner)->patch(route('organizations.candidate', [$organization, $application->id]), ['stage' => 'wawancara', 'interview_at' => now()->addDay()->toISOString(), 'interview_location' => 'Kantor organisasi'])->assertSessionHasNoErrors();
    $this->actingAs($participant)->get(route('applications.index'))->assertInertia(fn (Assert $page) => $page->where('submissions.data.0.stage', 'wawancara')->where('submissions.data.0.interview_location', 'Kantor organisasi'));
});

test('organization membership isolates tenants and limits editor and reviewer permissions', function () {
    $owner = User::factory()->create();
    $organization = registerOrganization($owner);
    $organization->forceFill(['status' => ReviewStatus::Approved])->save();
    $outsider = User::factory()->withRoles(UserRole::Partner)->create();
    $reviewer = User::factory()->create();
    $this->actingAs($owner)->post(route('organizations.member', $organization), ['email' => $reviewer->email, 'permission' => 'reviewer'])->assertSessionHasNoErrors();
    $this->actingAs($outsider)->get(route('partner.dashboard', ['organization' => $organization->id]))->assertNotFound();
    $this->actingAs($outsider)->post(route('organizations.program', $organization), programPayload())->assertNotFound();
    $this->actingAs($reviewer)->post(route('organizations.program', $organization), programPayload())->assertNotFound();
    $this->actingAs($reviewer)->post(route('organizations.member', $organization), ['email' => $outsider->email, 'permission' => 'editor'])->assertNotFound();
    $member = DB::table('organization_members')->where('user_id', $reviewer->id)->first();
    $this->actingAs($owner)->delete(route('organizations.remove-member', [$organization, $member->id]))->assertSessionHasNoErrors();
    $this->actingAs($reviewer)->get(route('partner.dashboard', ['organization' => $organization->id]))->assertNotFound();
});

test('personal saved opportunities are never exposed as organization applicants', function () {
    $owner = User::factory()->create();
    $organization = registerOrganization($owner);
    $organization->forceFill(['status' => ReviewStatus::Approved])->save();
    $program = Opportunity::factory()->approved()->create(['organization_id' => $organization->id]);
    $participant = User::factory()->create();
    $this->actingAs($participant)->post(route('applications.store', $program))->assertSessionHasNoErrors();
    $this->actingAs($owner)->get(route('partner.dashboard'))->assertInertia(fn (Assert $page) => $page->has('portal.applications.data', 0));
});

test('editing a published program requires moderation and requirement checklist reaches participant', function () {
    $owner = User::factory()->create();
    $organization = registerOrganization($owner);
    $organization->forceFill(['status' => ReviewStatus::Approved])->save();
    $this->actingAs($owner)->post(route('organizations.program', $organization), [...programPayload(), 'requirements' => "CV\nEsai"])->assertSessionHasNoErrors();
    $program = Opportunity::query()->latest('id')->firstOrFail();
    $program->forceFill(['status' => ReviewStatus::Approved])->save();
    $participant = User::factory()->create();
    $this->actingAs($participant)->post(route('applications.store', $program))->assertSessionHasNoErrors();
    $application = Application::query()->where('user_id', $participant->id)->firstOrFail();
    expect($application->tasks()->count())->toBe(2);
    $this->actingAs($owner)->put(route('organizations.program-update', [$organization, $program]), [...programPayload(), 'title' => 'Judul diperbarui'])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('opportunities', ['id' => $program->id, 'status' => 'menunggu']);
});

test('program editors do not receive applicant data while owners and reviewers do', function () {
    $owner = User::factory()->create();
    $editor = User::factory()->create();
    $reviewer = User::factory()->create();
    $participant = User::factory()->create();
    $organization = registerOrganization($owner);
    $organization->forceFill(['status' => ReviewStatus::Approved])->save();
    $this->actingAs($owner)->post(route('organizations.member', $organization), ['email' => $editor->email, 'permission' => 'editor']);
    $this->actingAs($owner)->post(route('organizations.member', $organization), ['email' => $reviewer->email, 'permission' => 'reviewer']);
    $program = Opportunity::factory()->approved()->create(['organization_id' => $organization->id, 'accepts_applications' => true]);
    $this->actingAs($participant)->post(route('catalog.apply', $program), ['message' => 'Data pribadi saya', 'consent' => true]);

    $this->actingAs($editor)->get(route('partner.dashboard', ['section' => 'applicants']))
        ->assertInertia(fn (Assert $page) => $page->where('portal.canViewApplicants', false)->has('portal.applications.data', 0));
    $this->actingAs($reviewer)->get(route('partner.dashboard', ['section' => 'applicants']))
        ->assertInertia(fn (Assert $page) => $page->where('portal.canViewApplicants', true)->where('portal.applications.data.0.message', 'Data pribadi saya'));
});
