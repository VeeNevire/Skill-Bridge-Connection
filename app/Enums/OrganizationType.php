<?php

namespace App\Enums;

enum OrganizationType: string
{
    case Institution = 'institusi';
    case Company = 'perusahaan';
    case Foundation = 'yayasan';

    public function label(): string
    {
        return match ($this) {
            self::Institution => 'Institusi pendidikan',
            self::Company => 'Perusahaan',
            self::Foundation => 'Yayasan / lembaga',
        };
    }
}
