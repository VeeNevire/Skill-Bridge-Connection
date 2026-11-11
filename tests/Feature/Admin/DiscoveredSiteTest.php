<?php

use App\Enums\OpportunityType;
use App\Jobs\DiscoverSites;
use App\Jobs\RunScraper;
use App\Models\DiscoveredSite;
use App\Models\Opportunity;
use App\Models\ScrapeSource;
use App\Models\User;
use App\Services\HermesClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

function fakeHermesSites(): void
{
    config(['hermes.base_url' => 'http://hermes.test/v1', 'hermes.poll_seconds' => 0]);
    Http::fake([
        'hermes.test/v1/runs' => Http::response(['run_id' => 'r1']),
        'hermes.test/v1/runs/r1' => Http::response(['status' => 'completed', 'output' => '```json
{"items":[{"name":"LPDP","url":"https://www.LPDP.kemenkeu.go.id/beasiswa/","description":"Beasiswa S2 dan S3"},{"name":"LPDP lagi","url":"https://lpdp.kemenkeu.go.id"},{"name":"Rusak","url":"bukan-url"}]}
```']),
    ]);
}

test('monthly discovery stores each domain once and keeps approvals', function () {
    fakeHermesSites();
    $job = new DiscoverSites(OpportunityType::Scholarship);

    $job->handle(app(HermesClient::class));
    DiscoveredSite::query()->firstOrFail()->update(['is_approved' => true]);
    $job->handle(app(HermesClient::class));

    $site = DiscoveredSite::query()->sole();
    expect($site->url)->toBe('https://lpdp.kemenkeu.go.id')
        ->and($site->type)->toBe(OpportunityType::Scholarship)
        ->and($site->period)->toBe(now()->format('Y-m'))
        ->and($site->is_approved)->toBeTrue();
});

test('admin lists, filters and approves sites', function () {
    $admin = User::factory()->admin()->create();
    $site = DiscoveredSite::query()->create(['type' => 'magang', 'name' => 'Magang Hub', 'url' => 'https://magang.test', 'period' => '2026-11']);
    DiscoveredSite::query()->create(['type' => 'beasiswa', 'name' => 'Beasiswa Hub', 'url' => 'https://beasiswa.test', 'period' => '2026-10']);

    $this->actingAs($admin)->get(route('admin.scrapers.sites.index', ['type' => 'magang']))
        ->assertInertia(fn (Assert $page) => $page->component('admin/sites/index')->has('sites.data', 1)->where('periods', ['2026-11', '2026-10']));

    Queue::fake();
    $this->actingAs($admin)->patch(route('admin.scrapers.sites.update', $site), ['is_approved' => true])->assertRedirect();
    expect($site->fresh()->is_approved)->toBeTrue();

    $this->actingAs($admin)->get(route('admin.scrapers.sites.index', ['status' => 'disetujui']))
        ->assertInertia(fn (Assert $page) => $page->has('sites.data', 1)->where('sites.data.0.name', 'Magang Hub'));

    $this->actingAs($admin)->post(route('admin.scrapers.sites.run'))->assertRedirect();
    Queue::assertPushed(DiscoverSites::class, 3);
});

test('non admin cannot open the site directory', function () {
    $this->actingAs(User::factory()->create())->get(route('admin.scrapers.sites.index'))->assertForbidden();
});

test('approving a site makes it a scraper source and unapproving pauses it', function () {
    Queue::fake();
    $admin = User::factory()->admin()->create();
    $site = DiscoveredSite::query()->create(['type' => 'magang', 'name' => 'Magang Hub', 'url' => 'https://magang.test', 'period' => '2026-11']);

    $this->actingAs($admin)->patch(route('admin.scrapers.sites.update', $site), ['is_approved' => true]);
    $this->actingAs($admin)->patch(route('admin.scrapers.sites.update', $site), ['is_approved' => false]);
    $this->actingAs($admin)->patch(route('admin.scrapers.sites.update', $site), ['is_approved' => true]);

    $source = ScrapeSource::query()->sole();
    expect($source->type)->toBe(OpportunityType::Internship)
        ->and($source->url)->toBeNull()
        ->and($source->keywords)->toContain('magang.test')
        ->and($source->is_active)->toBeTrue()
        ->and($site->fresh()->scrape_source_id)->toBe($source->id);
    Queue::assertPushed(RunScraper::class, 2);

    $this->actingAs($admin)->patch(route('admin.scrapers.sites.update', $site), ['is_approved' => false]);
    expect($source->fresh()->is_active)->toBeFalse();
});

test('scraped listings without a summary get a polite default text', function () {
    config(['hermes.base_url' => 'http://hermes.test/v1', 'hermes.poll_seconds' => 0]);
    Http::fake([
        'hermes.test/v1/runs' => Http::response(['run_id' => 'r2']),
        'hermes.test/v1/runs/r2' => Http::response(['status' => 'completed', 'output' => '{"items":[{"title":"Magang Data","url":"https://magang.test/1","organizer":"PT Contoh"}]}']),
    ]);
    $site = DiscoveredSite::query()->create(['type' => 'magang', 'name' => 'Magang Hub', 'url' => 'https://magang.test', 'period' => '2026-11']);

    (new RunScraper($site->approveAsSource()))->handle(app(HermesClient::class));

    expect(Opportunity::query()->sole()->summary)->toStartWith('Kesempatan magang dari PT Contoh kini terbuka untuk Anda.');
});
