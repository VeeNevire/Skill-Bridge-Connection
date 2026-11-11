<?php

use App\Enums\OpportunityType;
use App\Jobs\DiscoverSites;
use App\Jobs\RunScraper;
use App\Models\ScrapeSource;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Each source carries its own schedule (daily at a time, every N minutes, every N weeks); check once a minute.
Schedule::call(function () {
    ScrapeSource::query()->where('is_active', true)->where('next_run_at', '<=', now())->each(function (ScrapeSource $source) {
        RunScraper::dispatch($source);
        $source->forceFill(['next_run_at' => $source->nextRunAfter(now())])->saveQuietly();
    });
})->name('scrape-sources')->everyMinute()->withoutOverlapping();

// Monthly AI search for websites that run scholarship, internship or job programs; admins approve them in /admin/scraper/website.
Schedule::call(function () {
    foreach ([OpportunityType::Scholarship, OpportunityType::Internship, OpportunityType::Job] as $type) {
        DiscoverSites::dispatch($type);
    }
})->name('discover-sites')->monthlyOn(1, '03:00')->timezone(ScrapeSource::TIMEZONE);
