<?php

use App\Enums\OpportunityType;
use App\Enums\OrganizationType;
use App\Enums\UserRole;
use App\Models\Application;
use App\Models\ContentReport;
use App\Models\MentorProfile;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Counts the queries a page runs. The count must not grow with the number of rows,
 * otherwise the page has an N+1 problem and gets slower as data grows.
 */
function queriesFor(User $admin, string $url): int
{
    Cache::flush();
    $admin = $admin->fresh();
    DB::flushQueryLog();
    DB::enableQueryLog();

    test()->actingAs($admin)->get($url)->assertOk();

    return count(DB::getQueryLog());
}

test('admin list pages run a constant number of queries regardless of data size', function (string $route, Closure $seed) {
    $admin = User::factory()->admin()->create();

    $seed(3);
    $small = queriesFor($admin, route($route));

    $seed(25);
    $large = queriesFor($admin, route($route));

    expect($large)->toBe($small);
})->with([
    'users' => ['admin.users.index', fn () => fn (int $n) => User::factory()->count($n)->create()],
    'moderation' => ['admin.moderation.index', fn () => fn (int $n) => Opportunity::factory()->count($n)->create()],
    'reports' => ['admin.reports.index', fn () => fn (int $n) => ContentReport::factory()->count($n)->create()],
    'mentor verification' => ['admin.verifications.index', fn () => fn (int $n) => MentorProfile::factory()->count($n)->create()],
    'dashboard' => ['admin.dashboard', fn () => fn (int $n) => Opportunity::factory()->count($n)->create()],
]);

test('talent passport query count remains constant as education entries grow', function () {
    $user = User::factory()->create();
    $add = function (int $count) use ($user): void {
        foreach (range(1, $count) as $number) {
            DB::table('educations')->insert(['user_id' => $user->id, 'institution' => "Kampus $number", 'degree' => 'S1']);
        }
    };
    $add(3);
    $small = queriesFor($user, route('passport.edit'));
    $add(25);
    $large = queriesFor($user, route('passport.edit'));
    expect($large)->toBe($small);
});

test('public catalog query count remains constant as opportunities grow', function () {
    $user = User::factory()->create();
    Opportunity::factory()->approved()->count(3)->create(['type' => OpportunityType::Scholarship]);
    $small = queriesFor($user, route('catalog.index', 'beasiswa'));
    Opportunity::factory()->approved()->count(25)->create(['type' => OpportunityType::Scholarship]);
    $large = queriesFor($user, route('catalog.index', 'beasiswa'));
    expect($large)->toBe($small);
});

test('participant overview query count remains constant as saved opportunities grow', function () {
    $user = User::factory()->create();
    $add = function (int $count) use ($user): void {
        Opportunity::factory()->approved()->count($count)->create()->each(function ($opportunity) use ($user): void {
            Application::query()->create(['user_id' => $user->id, 'opportunity_id' => $opportunity->id]);
        });
    };
    $add(3);
    $small = queriesFor($user, route('dashboard'));
    $add(25);
    $large = queriesFor($user, route('dashboard'));
    expect($large)->toBe($small);
});

test('mentor dashboard query count remains constant as sessions grow', function () {
    $mentor = User::factory()->withRoles(UserRole::Mentor)->create();
    $participant = User::factory()->create();
    $add = function (int $count) use ($mentor, $participant): void {
        foreach (range(1, $count) as $number) {
            DB::table('mentoring_requests')->insert(['mentor_id' => $mentor->id, 'participant_id' => $participant->id, 'topic' => "Topik $number", 'goal' => 'Review', 'starts_at' => now()->addDay(), 'created_at' => now(), 'updated_at' => now()]);
        }
    };
    $add(3);
    $small = queriesFor($mentor, route('mentor.dashboard'));
    $add(25);
    $large = queriesFor($mentor, route('mentor.dashboard'));
    expect($large)->toBe($small);
});

test('organization portal query count remains constant as programs grow', function () {
    $owner = User::factory()->withRoles(UserRole::Partner)->create();
    $organization = Organization::factory()->verified()->create(['type' => OrganizationType::Institution]);
    DB::table('organization_members')->insert(['organization_id' => $organization->id, 'user_id' => $owner->id, 'permission' => 'owner']);
    Opportunity::factory()->count(3)->create(['organization_id' => $organization->id]);
    $small = queriesFor($owner, route('partner.dashboard'));
    Opportunity::factory()->count(25)->create(['organization_id' => $organization->id]);
    $large = queriesFor($owner, route('partner.dashboard'));
    expect($large)->toBe($small);
});
