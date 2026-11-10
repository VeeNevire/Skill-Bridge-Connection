<?php

namespace Database\Seeders;

use App\Models\ScrapeSource;
use Illuminate\Database\Seeder;

/** Starter sources checked by hand; run with `php artisan db:seed --class=ScrapeSourceSeeder`. */
class ScrapeSourceSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            ['name' => 'IndBeasiswa', 'type' => 'beasiswa', 'url' => 'https://www.indbeasiswa.com/', 'keywords' => null],
            ['name' => 'Pencarian AI: Beasiswa', 'type' => 'beasiswa', 'url' => null, 'keywords' => 'beasiswa S1 dan S2 dalam dan luar negeri untuk pelajar Indonesia'],
            ['name' => 'Kalibrr Magang', 'type' => 'magang', 'url' => 'https://www.kalibrr.com/id-ID/home/te/magang', 'keywords' => null],
            ['name' => 'Pencarian AI: Magang', 'type' => 'magang', 'url' => null, 'keywords' => 'magang mahasiswa dan fresh graduate di Indonesia'],
            ['name' => 'Pencarian AI: Karier', 'type' => 'lowongan', 'url' => null, 'keywords' => 'lowongan kerja entry level dan fresh graduate di Indonesia'],
        ];

        foreach ($sources as $source) {
            ScrapeSource::query()->updateOrCreate(['name' => $source['name'], 'type' => $source['type']], [...$source, 'is_active' => true]);
        }
    }
}
