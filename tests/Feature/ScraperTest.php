<?php

use App\Enums\OpportunityType;
use App\Enums\ReviewStatus;
use App\Jobs\RunScraper;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\ScrapeSource;
use App\Models\User;
use App\Services\HermesClient;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

function scrapeSource(array $attributes = []): ScrapeSource
{
    return ScrapeSource::query()->create(['name' => 'Info Beasiswa', 'type' => 'beasiswa', 'url' => 'https://contoh.test/beasiswa/', ...$attributes]);
}

function runScraper(ScrapeSource $source): void
{
    (new RunScraper($source))->handle(app(HermesClient::class));
}

const LISTING_HTML = <<<'HTML'
<html><body>
<nav><h3><a href="/tentang">Tentang kami dan redaksi</a></h3></nav>
<main>
<article><h2><a href="/beasiswa-lpdp">Beasiswa LPDP 2027</a></h2><p>Beasiswa penuh untuk jenjang S2 dan S3 dari pemerintah.</p><span>Batas pendaftaran: 15 Desember 2099</span></article>
<article><h2><a href="detail/unggulan">Beasiswa Unggulan Kemendikbud</a></h2><span>Diposting 1 Januari 2020</span></article>
<article><h2>Tanpa link sama sekali</h2></article>
</main>
<footer><h4><a href="/kontak">Hubungi kami sekarang</a></h4></footer>
</body></html>
HTML;

test('scraper reads listings straight from html and dedupes on rerun', function () {
    Http::fake(['contoh.test/*' => Http::response(LISTING_HTML)]);
    $source = scrapeSource();

    runScraper($source);
    runScraper($source->fresh());

    expect(Opportunity::query()->pluck('source_url')->sort()->values()->all())->toBe(['https://contoh.test/beasiswa-lpdp', 'https://contoh.test/beasiswa/detail/unggulan']);
    $lpdp = Opportunity::query()->where('source_url', 'https://contoh.test/beasiswa-lpdp')->firstOrFail();
    expect($lpdp->status)->toBe(ReviewStatus::Approved)
        ->and($lpdp->type)->toBe(OpportunityType::Scholarship)
        ->and($lpdp->summary)->toBe('Beasiswa penuh untuk jenjang S2 dan S3 dari pemerintah.')
        ->and($lpdp->deadline->toDateString())->toBe('2099-12-15');
    // A post date is not a deadline.
    expect(Opportunity::query()->where('source_url', 'https://contoh.test/beasiswa/detail/unggulan')->value('deadline'))->toBeNull();
    expect($source->fresh())->last_status->toBe('berhasil')->last_count->toBe(2);

    $this->get(route('catalog.index', 'beasiswa'))->assertInertia(fn (Assert $page) => $page->has('opportunities.data', 2)->has('sources', 1));
});

test('scraper prefers json-ld job postings', function () {
    Http::fake(['contoh.test/*' => Http::response('<html><head><script type="application/ld+json">{"@context":"https://schema.org","@type":"JobPosting","title":"Magang Data Analyst","url":"https://contoh.test/loker/1","validThrough":"2099-01-31","hiringOrganization":{"name":"PT Contoh"}}</script></head><body></body></html>')]);
    runScraper(scrapeSource(['type' => 'magang', 'url' => 'https://contoh.test/loker']));

    $row = Opportunity::query()->sole();
    expect($row->title)->toBe('Magang Data Analyst')->and($row->details)->toBe(['penyelenggara' => 'PT Contoh'])->and($row->deadline->toDateString())->toBe('2099-01-31');
});

test('sources without a url let hermes search the web', function () {
    config(['hermes.base_url' => 'http://hermes.test/v1', 'hermes.poll_seconds' => 0]);
    Http::fake([
        'hermes.test/v1/runs' => Http::response(['run_id' => 'r1']),
        'hermes.test/v1/runs/r1' => Http::response(['status' => 'completed', 'output' => "Berikut hasilnya:\n```json\n{\"items\":[{\"title\":\"Lowongan Backend\",\"url\":\"https://loker.test/1\",\"summary\":\"Go dan PHP\",\"deadline\":\"2099-05-01\",\"organizer\":\"PT A\"},{\"title\":\"Tanpa URL\",\"url\":\"bukan-url\"}]}\n```"]),
    ]);
    $source = scrapeSource(['type' => 'lowongan', 'url' => null, 'keywords' => 'backend developer junior']);

    runScraper($source);

    expect(Opportunity::query()->sole())->title->toBe('Lowongan Backend')->source_url->toBe('https://loker.test/1');
    Http::assertSent(fn ($request) => str_contains((string) ($request['input'] ?? ''), 'backend developer junior'));
});

test('scraper records failures instead of throwing', function () {
    Http::fake(['contoh.test/*' => Http::response('down', 500)]);
    $source = scrapeSource();

    runScraper($source);

    expect($source->fresh())->last_status->toBe('gagal')->last_error->not->toBeNull();
});

test('admins manage sources per menu', function () {
    Queue::fake();
    Http::fake(['contoh.test/*' => Http::response(LISTING_HTML)]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.scrapers.index', 'magang'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/scrapers/index')->where('type', 'magang'));
    $this->actingAs($admin)->get('/admin/scraper/kelas')->assertNotFound();
    $this->actingAs($admin)->post(route('admin.scrapers.store', 'magang'), ['name' => 'X', 'url' => 'file:///etc/passwd'])->assertSessionHasErrors('url');
    $this->actingAs($admin)->post(route('admin.scrapers.store', 'magang'), ['name' => 'AI', 'url' => ''])->assertSessionHasErrors('keywords');
    $this->actingAs($admin)->post(route('admin.scrapers.store', 'magang'), ['name' => 'Magang ID', 'url' => 'https://contoh.test/magang', 'is_active' => true])->assertSessionHasNoErrors();
    $source = ScrapeSource::query()->sole();
    expect($source->type)->toBe(OpportunityType::Internship);

    $this->actingAs($admin)->postJson(route('admin.scrapers.preview', $source))->assertOk()->assertJsonCount(2, 'items');
    $this->actingAs($admin)->post(route('admin.scrapers.run', $source))->assertRedirect();
    Queue::assertPushed(RunScraper::class);

    $this->actingAs($admin)->delete(route('admin.scrapers.destroy', $source))->assertRedirect();
    expect(ScrapeSource::query()->count())->toBe(0);
});

test('admins add, edit and delete listings by hand', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.scrapers.opportunities.store', 'lowongan'), ['title' => 'Staf HR', 'deadline' => '2099-02-01', 'source_url' => 'https://pt.test/hr', 'penyelenggara' => 'PT B', 'tipe_kerja' => 'Penuh waktu'])->assertSessionHasNoErrors();
    $row = Opportunity::query()->sole();
    expect($row->type)->toBe(OpportunityType::Job)->and($row->status)->toBe(ReviewStatus::Approved)->and($row->details)->toBe(['penyelenggara' => 'PT B', 'tipe_kerja' => 'Penuh waktu']);
    $this->get(route('catalog.index', 'lowongan'))->assertInertia(fn (Assert $page) => $page->has('opportunities.data', 1));

    $this->actingAs($admin)->patch(route('admin.scrapers.opportunities.update', $row), ['title' => 'Staf HR Senior'])->assertSessionHasNoErrors();
    expect($row->fresh()->title)->toBe('Staf HR Senior');

    $partner = Opportunity::factory()->for(Organization::factory())->create();
    $this->actingAs($admin)->delete(route('admin.scrapers.opportunities.destroy', $partner))->assertNotFound();
    $this->actingAs($admin)->delete(route('admin.scrapers.opportunities.destroy', $row))->assertRedirect();
    expect(Opportunity::query()->whereKey($row->id)->exists())->toBeFalse();
});

test('participants can not manage scrapers', function () {
    $this->actingAs(User::factory()->create())->get(route('admin.scrapers.index', 'beasiswa'))->assertForbidden();
});

test('assistant answers from admin-managed data through hermes', function () {
    $source = scrapeSource();
    Opportunity::query()->create(['type' => 'beasiswa', 'title' => 'Beasiswa LPDP 2027', 'source_url' => 'https://contoh.test/lpdp', 'scrape_source_id' => $source->id])->forceFill(['status' => ReviewStatus::Approved])->save();
    config(['hermes.base_url' => 'http://hermes.test/v1', 'hermes.poll_seconds' => 0]);
    Http::fake([
        'hermes.test/v1/runs' => Http::response(['run_id' => 'r1']),
        'hermes.test/v1/runs/r1' => Http::response(['status' => 'completed', 'output' => 'Coba Beasiswa LPDP 2027: https://contoh.test/lpdp']),
    ]);

    $this->actingAs(User::factory()->create())->postJson(route('catalog.ask'), ['question' => 'beasiswa lpdp?', 'type' => 'beasiswa'])
        ->assertOk()->assertJson(['answer' => 'Coba Beasiswa LPDP 2027: https://contoh.test/lpdp']);
    Http::assertSent(fn ($request) => str_contains((string) ($request['input'] ?? ''), 'Beasiswa LPDP 2027'));
});

test('assistant reports hermes outages', function () {
    config(['hermes.base_url' => 'http://hermes.test/v1']);
    Http::fake(['hermes.test/*' => Http::response('nope', 502)]);

    $this->postJson(route('catalog.ask'), ['question' => 'x'])->assertUnauthorized();
    $this->actingAs(User::factory()->create())->postJson(route('catalog.ask'), ['question' => 'magang IT'])->assertStatus(503)->assertJsonStructure(['message']);
});

test('schedules default to daily 03:00 wib and support minutes and weeks', function () {
    $this->travelTo(Carbon::parse('2026-11-10 10:00', 'UTC')); // 17:00 WIB

    expect(scrapeSource()->next_run_at->toDateTimeString())->toBe('2026-11-10 20:00:00'); // 03:00 WIB tomorrow
    $daily = scrapeSource(['name' => 'Pagi', 'schedule' => 'harian', 'schedule_time' => '18:30']);
    expect($daily->next_run_at->toDateTimeString())->toBe('2026-11-10 11:30:00');
    $minutes = scrapeSource(['name' => 'Menit', 'schedule' => 'menit', 'schedule_every' => 15]);
    expect($minutes->next_run_at->toDateTimeString())->toBe('2026-11-10 10:15:00')
        ->and($minutes->nextRunAfter(now())->toDateTimeString())->toBe('2026-11-10 10:15:00');
    $weekly = scrapeSource(['name' => 'Minggu', 'schedule' => 'mingguan', 'schedule_every' => 2, 'schedule_time' => '08:00']);
    expect($weekly->next_run_at->toDateTimeString())->toBe('2026-11-11 01:00:00')
        ->and($weekly->nextRunAfter(Carbon::parse('2026-11-11 01:00', 'UTC'))->toDateTimeString())->toBe('2026-11-25 01:00:00');
});

test('the scheduler dispatches only active sources that are due', function () {
    Queue::fake();
    $this->travelTo(Carbon::parse('2026-11-10 10:00', 'UTC'));
    $due = scrapeSource(['schedule' => 'menit', 'schedule_every' => 5]);
    scrapeSource(['name' => 'Nanti', 'schedule' => 'menit', 'schedule_every' => 60]);
    scrapeSource(['name' => 'Mati', 'schedule' => 'menit', 'schedule_every' => 5, 'is_active' => false]);

    $this->travel(5)->minutes();
    $this->artisan('schedule:run')->assertSuccessful();

    Queue::assertPushed(RunScraper::class, 1);
    Queue::assertPushed(RunScraper::class, fn (RunScraper $job) => $job->source->is($due));
    expect($due->fresh()->next_run_at->toDateTimeString())->toBe('2026-11-10 10:10:00');
});

test('admins save optional schedules with validation', function () {
    $admin = User::factory()->admin()->create();
    $base = ['name' => 'Sumber', 'url' => 'https://contoh.test/x', 'is_active' => true];

    $this->actingAs($admin)->post(route('admin.scrapers.store', 'beasiswa'), [...$base, 'schedule' => 'menit', 'schedule_every' => 2])->assertSessionHasErrors('schedule_every');
    $this->actingAs($admin)->post(route('admin.scrapers.store', 'beasiswa'), [...$base, 'schedule' => 'harian', 'schedule_time' => '25:00'])->assertSessionHasErrors('schedule_time');
    $this->actingAs($admin)->post(route('admin.scrapers.store', 'beasiswa'), [...$base, 'schedule' => 'mingguan', 'schedule_every' => 3, 'schedule_time' => '07:00'])->assertSessionHasNoErrors();
    expect(ScrapeSource::query()->sole()->scheduleLabel())->toBe('Setiap 3 minggu pukul 07:00');
});
