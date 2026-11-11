<?php

namespace App\Jobs;

use App\Enums\OpportunityType;
use App\Models\DiscoveredSite;
use App\Services\HermesClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Asks the AI for websites offering one type of opportunity and stores each domain once.
 * Re-running never touches `is_approved`, so admin decisions survive the monthly refresh.
 */
class DiscoverSites implements ShouldQueue
{
    use Queueable;

    public int $timeout = 600;

    public function __construct(public OpportunityType $type) {}

    public function handle(HermesClient $hermes): void
    {
        $period = now()->format('Y-m');
        foreach (self::clean($hermes->discoverSites($this->type->label())) as $site) {
            DiscoveredSite::query()->updateOrCreate(['url' => $site['url']], [...$site, 'type' => $this->type, 'period' => $period]);
        }
    }

    /**
     * Keep rows with a name and an http(s) URL, reduced to its origin and deduped.
     *
     * @param  array<int, mixed>  $items
     * @return list<array{name: string, url: string, description: string|null}>
     */
    public static function clean(array $items): array
    {
        $clean = [];
        foreach ($items as $item) {
            $name = is_array($item) && is_string($item['name'] ?? null) ? trim($item['name']) : '';
            $url = is_array($item) && is_string($item['url'] ?? null) ? trim($item['url']) : '';
            $parts = parse_url($url);
            $host = preg_replace('/^www\./i', '', strtolower($parts['host'] ?? ''));
            if ($name === '' || ! in_array($parts['scheme'] ?? '', ['http', 'https'], true) || ! $host) {
                continue;
            }
            // ponytail: forces https; keep the found scheme if http-only sites show up.
            $origin = 'https://'.$host;
            $description = is_string($item['description'] ?? null) ? trim($item['description']) : '';
            $clean[$origin] ??= [
                'name' => str($name)->limit(250)->toString(),
                'url' => $origin,
                'description' => $description !== '' ? str($description)->limit(1000)->toString() : null,
            ];
        }

        return array_values($clean);
    }
}
