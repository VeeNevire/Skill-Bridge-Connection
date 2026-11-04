<?php

namespace App\Models;

use App\Enums\ReviewStatus;
use App\Models\Concerns\Reviewable;
use Database\Factories\MentorProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $expertise
 * @property int $years_experience
 * @property ReviewStatus $status
 */
#[Fillable(['expertise', 'years_experience', 'bio'])]
class MentorProfile extends Model
{
    /** @use HasFactory<MentorProfileFactory> */
    use HasFactory, Reviewable;

    protected $attributes = [
        'status' => 'menunggu',
    ];

    protected function casts(): array
    {
        return [
            'status' => ReviewStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    /** @return HasMany<MentorAvailability, $this> */
    public function availability(): HasMany
    {
        return $this->hasMany(MentorAvailability::class, 'mentor_id', 'user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
