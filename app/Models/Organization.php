<?php

namespace App\Models;

use App\Enums\OrganizationType;
use App\Enums\ReviewStatus;
use App\Models\Concerns\Reviewable;
use Database\Factories\OrganizationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A partner (institution, company or foundation) that must be verified before publishing.
 *
 * @property int $id
 * @property string $name
 * @property OrganizationType $type
 * @property string $email
 * @property ReviewStatus $status
 */
#[Fillable(['name', 'type', 'email', 'website', 'description'])]
class Organization extends Model
{
    /** @use HasFactory<OrganizationFactory> */
    use HasFactory, Reviewable;

    protected $attributes = [
        'status' => 'menunggu',
    ];

    protected function casts(): array
    {
        return [
            'type' => OrganizationType::class,
            'status' => ReviewStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<Opportunity, $this>
     */
    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }
}
