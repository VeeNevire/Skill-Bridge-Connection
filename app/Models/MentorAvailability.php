<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MentorAvailability extends Model
{
    protected $table = 'mentor_availability';

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'duration' => 'integer'];
    }
}
