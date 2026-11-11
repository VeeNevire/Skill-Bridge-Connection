<?php

namespace App\Models;

use App\Enums\OpportunityType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A website found by the monthly AI search; admins approve the ones worth keeping.
 *
 * @property int $id
 * @property OpportunityType $type
 * @property string $name
 * @property string $url
 * @property string|null $description
 * @property string $period
 * @property bool $is_approved
 * @property int|null $scrape_source_id
 */
#[Fillable(['type', 'name', 'url', 'description', 'period', 'is_approved'])]
class DiscoveredSite extends Model
{
    protected function casts(): array
    {
        return [
            'type' => OpportunityType::class,
            'is_approved' => 'boolean',
        ];
    }

    /**
     * Turn this site into an active scraper source (created once, reused after) and return it.
     * Without a page URL the AI searches the web, kept to this site's domain by the keywords.
     */
    public function approveAsSource(): ScrapeSource
    {
        $host = (string) parse_url($this->url, PHP_URL_HOST);
        $source = $this->scrapeSource ?? new ScrapeSource;
        $source->fill([
            'name' => str($this->name)->limit(120)->toString(),
            'type' => $this->type,
            'keywords' => str("{$this->type->label()} terbaru yang masih buka dari {$this->name}. Ambil hanya dari halaman di domain {$host} ({$this->url}).")->limit(500)->toString(),
            'is_active' => true,
        ])->save();
        $this->forceFill(['is_approved' => true, 'scrape_source_id' => $source->id])->save();

        return $source;
    }

    /**
     * @return BelongsTo<ScrapeSource, $this>
     */
    public function scrapeSource(): BelongsTo
    {
        return $this->belongsTo(ScrapeSource::class);
    }
}
