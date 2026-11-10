<?php

use App\Models\Opportunity;
use App\Models\ScrapeSource;
use App\Services\HermesClient;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
});

function scholarshipApiSource(array $attributes = []): ScrapeSource
{
    return ScrapeSource::create(array_merge(['name' => 'Sumber Beasiswa', 'type' => 'beasiswa', 'url' => 'https://scholarship.test', 'is_active' => true], $attributes));
}

test('scholarship api filters and paginates approved open scholarships', function () {
    $source = scholarshipApiSource();
    $visible = Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'title' => 'Beasiswa Teknik', 'scrape_source_id' => $source->id, 'details' => ['jenjang' => 'S2']]);
    Opportunity::factory()->create(['type' => 'beasiswa', 'title' => 'Beasiswa Teknik Draft']);
    Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'deadline' => today()->subDay()]);
    Opportunity::factory()->approved()->create(['type' => 'magang']);
    $this->getJson('/api/v1/beasiswa?q=Teknik&level=S2&per_page=1')->assertOk()
        ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $visible->id)->assertJsonPath('meta.total', 1);
    $this->getJson('/api/v1/beasiswa/'.$visible->id)->assertOk()->assertJsonPath('data.source.id', $source->id);
    $this->getJson('/api/v1/beasiswa?per_page=1000')->assertUnprocessable();
});

test('scholarship detail hides drafts expired listings and inactive sources', function () {
    $inactive = scholarshipApiSource(['is_active' => false]);
    $rows = [
        Opportunity::factory()->create(['type' => 'beasiswa']),
        Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'deadline' => today()->subDay()]),
        Opportunity::factory()->approved()->create(['type' => 'magang']),
        Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'scrape_source_id' => $inactive->id]),
    ];
    foreach ($rows as $row) {
        $this->getJson('/api/v1/beasiswa/'.$row->id)->assertNotFound();
    }
});

test('scholarship ai uses only approved data from active registered scholarship websites', function () {
    $source = scholarshipApiSource();
    $item = Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'title' => 'Teknik S2 Resmi', 'scrape_source_id' => $source->id]);
    Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'title' => 'Manual Rahasia']);
    $inactive = scholarshipApiSource(['is_active' => false]);
    Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'title' => 'Sumber Nonaktif', 'scrape_source_id' => $inactive->id]);
    $this->mock(HermesClient::class)->shouldReceive('ask')->once()->withArgs(fn ($prompt) => str_contains($prompt, 'Teknik S2 Resmi') && ! str_contains($prompt, 'Manual Rahasia') && ! str_contains($prompt, 'Sumber Nonaktif'))->andReturn('Lihat Teknik S2 Resmi.');
    $this->postJson('/api/v1/beasiswa/tanya', ['question' => 'Beasiswa teknik apa yang ada?'])->assertOk()
        ->assertJsonPath('answer', 'Lihat Teknik S2 Resmi.')->assertJsonCount(1, 'references')->assertJsonPath('references.0.id', $item->id)->assertJsonPath('sources.0.id', $source->id);
});

test('scholarship ai validates questions and handles empty data without calling ai', function () {
    $this->mock(HermesClient::class)->shouldNotReceive('ask');
    $this->postJson('/api/v1/beasiswa/tanya', [])->assertUnprocessable();
    $this->postJson('/api/v1/beasiswa/tanya', ['question' => '   '])->assertUnprocessable();
    $this->postJson('/api/v1/beasiswa/tanya', ['question' => 'Beasiswa S1?'])->assertOk()->assertJsonPath('references', []);
});

test('scholarship ai returns service unavailable when hermes fails', function () {
    $source = scholarshipApiSource();
    Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'scrape_source_id' => $source->id]);
    $this->mock(HermesClient::class)->shouldReceive('ask')->once()->andThrow(new RuntimeException('Asisten AI sedang bermasalah.'));
    $this->postJson('/api/v1/beasiswa/tanya', ['question' => 'Beasiswa apa?'])->assertStatus(503)->assertJsonPath('message', 'Asisten AI sedang bermasalah.');
});

test('scholarship ai limits requests per client', function () {
    $this->mock(HermesClient::class)->shouldNotReceive('ask');
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/v1/beasiswa/tanya', ['question' => 'Ada beasiswa?'])->assertOk();
    }
    $this->postJson('/api/v1/beasiswa/tanya', ['question' => 'Ada beasiswa?'])->assertStatus(429);
});

test('scholarship ai restricts context to the selected scholarship', function () {
    $source = scholarshipApiSource();
    $selected = Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'title' => 'Pilihan Khusus', 'scrape_source_id' => $source->id]);
    Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'title' => 'Beasiswa Lain', 'scrape_source_id' => $source->id]);
    $this->mock(HermesClient::class)->shouldReceive('ask')->once()->withArgs(fn ($prompt) => str_contains($prompt, 'Pilihan Khusus') && ! str_contains($prompt, 'Beasiswa Lain'))->andReturn('Informasi pilihan khusus.');
    $this->postJson('/api/v1/beasiswa/tanya', ['question' => 'Apa syaratnya?', 'scholarship_id' => $selected->id])->assertOk()->assertJsonCount(1, 'references')->assertJsonPath('references.0.id', $selected->id);
    $this->postJson('/api/v1/beasiswa/tanya', ['question' => 'Apa syaratnya?', 'scholarship_id' => 999999])->assertNotFound();
});

test('selected manual scholarships visible in catalogue can be discussed with ai', function () {
    $selected = Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'title' => 'Beasiswa Manual Terbit', 'scrape_source_id' => null]);
    $draft = Opportunity::factory()->create(['type' => 'beasiswa']);
    $expired = Opportunity::factory()->approved()->create(['type' => 'beasiswa', 'deadline' => today()->subDay()]);
    $this->mock(HermesClient::class)->shouldReceive('ask')->once()->withArgs(fn ($prompt) => str_contains($prompt, 'Beasiswa Manual Terbit') && str_contains($prompt, 'Data katalog yang disetujui admin') && str_contains($prompt, '"limited_context":true') && str_contains($prompt, 'Jelaskan bahwa konteks terbatas'))->andReturn('Jawaban dari katalog.');
    $this->getJson('/api/v1/beasiswa/'.$selected->id)->assertOk();
    $this->postJson('/api/v1/beasiswa/tanya', ['question' => 'Apa syaratnya?', 'scholarship_id' => $selected->id])->assertOk()->assertJsonPath('references.0.id', $selected->id)->assertJsonCount(1, 'references');
    foreach ([$draft, $expired] as $hidden) {
        $this->postJson('/api/v1/beasiswa/tanya', ['question' => 'Apa syaratnya?', 'scholarship_id' => $hidden->id])->assertNotFound();
    }
});
