<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['topic', 'goal', 'status', 'shared_note', 'private_note', 'rating', 'feedback'])]
#[Hidden(['private_note'])]
class MentoringRequest extends Model
{
    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'rating' => 'integer'];
    }

    /** @return BelongsTo<User, $this> */
    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    /** @return BelongsTo<User, $this> */
    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }
}
