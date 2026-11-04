<?php

namespace App\Enums;

/**
 * Platform roles from the blueprint (section 4). One account can hold several roles.
 */
enum UserRole: string
{
    case Admin = 'admin';
    case Participant = 'peserta';
    case Mentor = 'mentor';
    case Partner = 'mitra';
    case Company = 'perusahaan';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Super Admin',
            self::Participant => 'Peserta',
            self::Mentor => 'Mentor',
            self::Partner => 'Mitra Pendidikan',
            self::Company => 'Perusahaan',
        };
    }

    /**
     * Route name of the dashboard for this role.
     */
    public function homeRoute(): string
    {
        return match ($this) {
            self::Admin => 'admin.dashboard',
            self::Participant => 'dashboard',
            self::Mentor => 'mentor.dashboard',
            self::Partner => 'partner.dashboard',
            self::Company => 'company.dashboard',
        };
    }

    /**
     * Order used to pick the landing dashboard for accounts with several roles.
     *
     * @return list<self>
     */
    public static function priority(): array
    {
        return [self::Admin, self::Partner, self::Company, self::Mentor, self::Participant];
    }

    public function description(): string
    {
        return match ($this) {
            self::Admin => 'Tata kelola platform: moderasi, verifikasi, pengguna, analitik.',
            self::Participant => 'Mencari beasiswa, kelas, mentor, dan peluang karier.',
            self::Mentor => 'Mengelola peserta bimbingan dan sesi mentoring.',
            self::Partner => 'Mempublikasikan program beasiswa/pendidikan dan mengelola pendaftar.',
            self::Company => 'Mempublikasikan magang dan lowongan, meninjau kandidat.',
        };
    }
}
