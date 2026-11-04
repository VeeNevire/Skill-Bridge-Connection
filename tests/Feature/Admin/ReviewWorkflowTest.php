<?php

use App\Enums\ReportStatus;
use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\ContentReport;
use App\Models\MentorProfile;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\Setting;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admins can verify an organization and the sidebar badge updates', function () {
    $organization = Organization::factory()->create();

    $this->actingAs($this->admin)->get(route('admin.verifications.index'))
        ->assertInertia(fn (Assert $page) => $page->where('adminBadges.verification', 1)->has('items.data', 1));

    $this->actingAs($this->admin)
        ->patch(route('admin.verifications.organizations.update', $organization), ['decision' => 'disetujui'])
        ->assertSessionHas('success');

    expect($organization->fresh())
        ->status->toBe(ReviewStatus::Approved)
        ->reviewed_by->toBe($this->admin->id);

    $this->actingAs($this->admin)->get(route('admin.verifications.index'))
        ->assertInertia(fn (Assert $page) => $page->where('adminBadges.verification', 0));
});

test('rejecting requires a reason', function () {
    $mentor = MentorProfile::factory()->create();

    $this->actingAs($this->admin)
        ->patch(route('admin.verifications.mentors.update', $mentor), ['decision' => 'ditolak'])
        ->assertSessionHasErrors('note');

    $this->actingAs($this->admin)
        ->patch(route('admin.verifications.mentors.update', $mentor), ['decision' => 'ditolak', 'note' => 'Dokumen belum lengkap'])
        ->assertSessionHasNoErrors();

    expect($mentor->fresh())->status->toBe(ReviewStatus::Rejected)->review_note->toBe('Dokumen belum lengkap')
        ->and($mentor->user->fresh()->hasRole(UserRole::Mentor))->toBeFalse();
});

test('verifying a mentor grants the mentor role on top of existing roles', function () {
    $mentor = MentorProfile::factory()->create();

    $this->actingAs($this->admin)
        ->patch(route('admin.verifications.mentors.update', $mentor), ['decision' => 'disetujui'])
        ->assertSessionHasNoErrors();

    $user = $mentor->user->fresh();

    expect($user->hasRole(UserRole::Mentor))->toBeTrue()
        ->and($user->hasRole(UserRole::Participant))->toBeTrue();
});

test('admins can approve content from the moderation queue', function () {
    $opportunity = Opportunity::factory()->create();

    $this->actingAs($this->admin)
        ->patch(route('admin.moderation.update', $opportunity), ['decision' => 'disetujui'])
        ->assertSessionHas('success');

    expect($opportunity->fresh()->status)->toBe(ReviewStatus::Approved)
        ->and(AuditLog::query()->where('action', 'opportunity.disetujui')->exists())->toBeTrue();
});

test('the moderation queue can be filtered by type', function () {
    Opportunity::factory()->count(2)->create(['type' => 'beasiswa']);
    Opportunity::factory()->create(['type' => 'kelas']);

    $this->actingAs($this->admin)
        ->get(route('admin.moderation.index', ['type' => 'kelas']))
        ->assertInertia(fn (Assert $page) => $page->has('opportunities.data', 1)->where('opportunities.data.0.type', 'kelas'));
});

test('resolving a report can take the content down', function () {
    $report = ContentReport::factory()->create();

    $this->actingAs($this->admin)
        ->patch(route('admin.reports.update', $report), ['status' => 'ditindak', 'take_down' => true])
        ->assertSessionHas('success');

    expect($report->fresh()->status)->toBe(ReportStatus::Resolved)
        ->and($report->opportunity->fresh()->status)->toBe(ReviewStatus::Rejected);
});

test('dismissing a report leaves the content alone', function () {
    $report = ContentReport::factory()->create(['opportunity_id' => Opportunity::factory()->approved()]);

    $this->actingAs($this->admin)->patch(route('admin.reports.update', $report), ['status' => 'diabaikan']);

    expect($report->fresh()->status)->toBe(ReportStatus::Dismissed)
        ->and($report->opportunity->fresh()->status)->toBe(ReviewStatus::Approved);
});

test('admins can manage categories', function () {
    $this->actingAs($this->admin)->post(route('admin.categories.store'), ['name' => 'Data Science'])->assertSessionHasNoErrors();
    $category = Category::query()->where('slug', 'data-science')->firstOrFail();

    $this->actingAs($this->admin)->post(route('admin.categories.store'), ['name' => 'Data Science'])->assertSessionHasErrors('slug');

    $opportunity = Opportunity::factory()->create(['category_id' => $category->id]);
    $this->actingAs($this->admin)->delete(route('admin.categories.destroy', $category))->assertSessionHas('success');

    expect(Category::query()->count())->toBe(0)
        ->and($opportunity->fresh()->category_id)->toBeNull();
});

test('admins can update platform settings', function () {
    $this->actingAs($this->admin)->put(route('admin.settings.update'), [
        'platform_name' => 'SkillBridge',
        'support_email' => 'halo@skillbridge.test',
        'registration_open' => false,
        'require_moderation' => true,
        'announcement' => 'Batch 2 dibuka',
    ])->assertSessionHas('success');

    expect(Setting::allValues())
        ->platform_name->toBe('SkillBridge')
        ->registration_open->toBeFalse();
});

test('the audit log uses cursor pagination and can be filtered', function () {
    AuditLog::record($this->admin, 'user.role', 'mengubah peran');
    AuditLog::record($this->admin, 'category.created', 'menambah kategori');

    $this->actingAs($this->admin)
        ->get(route('admin.audit-logs.index', ['action' => 'category']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->has('logs.next_page_url')
            ->where('logs.data.0.action', 'category.created'));
});
