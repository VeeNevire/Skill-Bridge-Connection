import { edit as accountSettings } from '@/routes/account';
// Sample data for the education-partner dashboard preview (blueprint §5.8, §6.2). Replace with API data later.
import {
    Building2,
    ChartLine,
    FileStack,
    LayoutGrid,
    Settings,
    Users,
    UsersRound,
} from 'lucide-react';
import type { NavItem } from '@/components/dashboard/dashboard-layout';

export const partnerNav: NavItem[] = [
    { key: 'overview', label: 'Ringkasan', icon: LayoutGrid },
    { key: 'programs', label: 'Program', icon: FileStack },
    { key: 'applicants', label: 'Pendaftar', icon: Users, badge: 18 },
    { key: 'performance', label: 'Performa', icon: ChartLine },
    { key: 'team', label: 'Anggota Tim', icon: UsersRound },
];

export const partnerAccountNav: NavItem[] = [
    { key: 'organization', label: 'Profil Organisasi', icon: Building2 },
    {
        key: 'settings',
        label: 'Pengaturan',
        icon: Settings,
        href: accountSettings.url(),
    },
];

export const organization = {
    name: 'Yayasan Cendekia Nusantara',
    type: 'Yayasan / lembaga',
    verified: true,
    verifiedAt: '12 Okt 2026',
};

export const partnerStats = {
    activePrograms: 4,
    newApplicants: 18,
    pendingModeration: 1,
    acceptanceRate: 24,
};

export type ProgramStatus = 'disetujui' | 'menunggu' | 'ditolak' | 'draf';

export const programs: {
    id: number;
    title: string;
    type: string;
    status: ProgramStatus;
    deadline: string;
    applicants: number;
    views: number;
    note?: string;
}[] = [
    {
        id: 1,
        title: 'Beasiswa Magister Luar Negeri 2027',
        type: 'Beasiswa',
        status: 'disetujui',
        deadline: '20 Des 2026',
        applicants: 86,
        views: 2140,
    },
    {
        id: 2,
        title: 'Beasiswa Pemimpin Muda',
        type: 'Beasiswa',
        status: 'disetujui',
        deadline: '15 Jan 2027',
        applicants: 54,
        views: 1630,
    },
    {
        id: 3,
        title: 'Kelas Menulis Esai Beasiswa',
        type: 'Kelas',
        status: 'menunggu',
        deadline: '—',
        applicants: 0,
        views: 0,
    },
    {
        id: 4,
        title: 'Program Riset Musim Panas',
        type: 'Beasiswa',
        status: 'ditolak',
        deadline: '28 Feb 2027',
        applicants: 0,
        views: 0,
        note: 'Lengkapi tautan kanal pendaftaran resmi.',
    },
    {
        id: 5,
        title: 'Beasiswa Afirmasi Daerah',
        type: 'Beasiswa',
        status: 'draf',
        deadline: '—',
        applicants: 0,
        views: 0,
    },
];

export const pipeline = [
    { stage: 'Mendaftar', count: 140 },
    { stage: 'Berkas lengkap', count: 96 },
    { stage: 'Seleksi', count: 42 },
    { stage: 'Wawancara', count: 18 },
    { stage: 'Diterima', count: 9 },
];

export const recentApplicants = [
    {
        name: 'Nadia Rahma',
        program: 'Beasiswa Magister Luar Negeri 2027',
        match: 92,
        status: 'Berkas lengkap',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        time: '1 jam lalu',
    },
    {
        name: 'Rizky Pratama',
        program: 'Beasiswa Pemimpin Muda',
        match: 84,
        status: 'Mendaftar',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        time: '3 jam lalu',
    },
    {
        name: 'Ayu Lestari',
        program: 'Beasiswa Magister Luar Negeri 2027',
        match: 78,
        status: 'Seleksi',
        avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
        time: 'Kemarin',
    },
    {
        name: 'Budi Santoso',
        program: 'Beasiswa Pemimpin Muda',
        match: 71,
        status: 'Mendaftar',
        avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
        time: 'Kemarin',
    },
];

// Weekly views vs. applications for the last 8 weeks.
export const performance = [
    { week: 'M1', views: 320, applications: 12 },
    { week: 'M2', views: 410, applications: 18 },
    { week: 'M3', views: 380, applications: 15 },
    { week: 'M4', views: 520, applications: 22 },
    { week: 'M5', views: 610, applications: 26 },
    { week: 'M6', views: 580, applications: 21 },
    { week: 'M7', views: 720, applications: 31 },
    { week: 'M8', views: 800, applications: 35 },
];

export const team = [
    {
        name: 'Rina Hapsari',
        role: 'Pengelola program',
        avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
    {
        name: 'Agus Wibowo',
        role: 'Peninjau berkas',
        avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
    },
    {
        name: 'Maya Sari',
        role: 'Admin organisasi',
        avatar: 'https://randomuser.me/api/portraits/women/57.jpg',
    },
];
