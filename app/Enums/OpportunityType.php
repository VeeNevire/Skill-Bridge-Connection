<?php

namespace App\Enums;

/**
 * Kinds of content partners publish. Adding a new kind only needs a new case here;
 * type-specific fields live in the opportunity's `details` JSON column.
 */
enum OpportunityType: string
{
    case Scholarship = 'beasiswa';
    case Course = 'kelas';
    case Job = 'lowongan';

    public function label(): string
    {
        return match ($this) {
            self::Scholarship => 'Beasiswa',
            self::Course => 'Kelas',
            self::Job => 'Lowongan',
        };
    }
}
