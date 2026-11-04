<?php

use App\Enums\OpportunityType;
use App\Models\Opportunity;
use Inertia\Testing\AssertableInertia as Assert;

test('catalog shows only approved unexpired opportunities of the requested type', function () {
    $visible = Opportunity::factory()->approved()->create(['type' => OpportunityType::Scholarship, 'title' => 'Beasiswa Terbuka', 'deadline' => now()->addDay()]);
    Opportunity::factory()->create(['type' => OpportunityType::Scholarship, 'title' => 'Belum Disetujui']);
    Opportunity::factory()->approved()->create(['type' => OpportunityType::Scholarship, 'title' => 'Sudah Lewat', 'deadline' => now()->subDay()]);
    Opportunity::factory()->approved()->create(['type' => OpportunityType::Course, 'title' => 'Kelas']);
    $this->get(route('catalog.index', 'beasiswa'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('catalog/index')->has('opportunities.data', 1)->where('opportunities.data.0.id', $visible->id));
});

test('catalog supports search and filters', function () {
    Opportunity::factory()->approved()->create(['type' => OpportunityType::Scholarship, 'title' => 'Beasiswa Sains', 'details' => ['jenjang' => 'S2', 'lokasi' => 'Dalam negeri']]);
    Opportunity::factory()->approved()->create(['type' => OpportunityType::Scholarship, 'title' => 'Beasiswa Seni', 'details' => ['jenjang' => 'S1', 'lokasi' => 'Luar negeri']]);
    $this->get(route('catalog.index', ['type' => 'beasiswa', 'q' => 'Sains', 'level' => 'S2', 'location' => 'Dalam negeri']))->assertOk()->assertInertia(fn (Assert $page) => $page->has('opportunities.data', 1)->where('opportunities.data.0.title', 'Beasiswa Sains'));
    $this->get(route('catalog.index', 'lain'))->assertNotFound();
});
