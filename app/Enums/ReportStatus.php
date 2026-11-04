<?php

namespace App\Enums;

enum ReportStatus: string
{
    case Open = 'terbuka';
    case Resolved = 'ditindak';
    case Dismissed = 'diabaikan';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Terbuka',
            self::Resolved => 'Ditindak',
            self::Dismissed => 'Diabaikan',
        };
    }
}
