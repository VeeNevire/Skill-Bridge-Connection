<?php

namespace App\Models;

use App\Enums\OpportunityType;
use App\Enums\ReviewStatus;
use App\Models\Concerns\Reviewable;
use Database\Factories\OpportunityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A scholarship, course or job. Fields that only apply to one type are kept in `details`.
 *
 * @property int $id
 * @property OpportunityType $type
 * @property string $title
 * @property array<string, mixed>|null $details
 * @property Carbon|null $deadline
 * @property ReviewStatus $status
 */
#[Fillable(['type', 'title', 'summary', 'details', 'deadline', 'source_url', 'organization_id', 'category_id', 'accepts_applications', 'scrape_source_id'])]
class Opportunity extends Model
{
    /** @use HasFactory<OpportunityFactory> */
    use HasFactory, Reviewable;

    protected $attributes = [
        'status' => 'menunggu',
    ];

    protected function casts(): array
    {
        return [
            'type' => OpportunityType::class,
            'accepts_applications' => 'boolean',
            'status' => ReviewStatus::class,
            'details' => 'array',
            'deadline' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Organization, $this>
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<ScrapeSource, $this>
     */
    public function scrapeSource(): BelongsTo
    {
        return $this->belongsTo(ScrapeSource::class);
    }

    /**
     * @return HasMany<ContentReport, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(ContentReport::class);
    }
}
