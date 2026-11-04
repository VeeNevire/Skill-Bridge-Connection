<?php

namespace App\Models\Concerns;

use App\Enums\ReviewStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Shared approve/reject workflow for moderated content and verification requests.
 *
 * @property ReviewStatus $status
 */
trait Reviewable
{
    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function review(User $reviewer, ReviewStatus $status, ?string $note = null): void
    {
        $this->forceFill([
            'status' => $status,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_note' => $note,
        ])->save();
    }

    /**
     * @param  Builder<static>  $query
     */
    public function scopePending(Builder $query): void
    {
        $query->where('status', ReviewStatus::Pending);
    }
}
