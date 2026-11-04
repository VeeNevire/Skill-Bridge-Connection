<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'completed', 'due_date'])]
class ApplicationTask extends Model
{
    protected function casts(): array
    {
        return ['completed' => 'boolean', 'due_date' => 'date'];
    }
}
