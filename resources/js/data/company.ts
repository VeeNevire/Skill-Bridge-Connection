import { edit as accountSettings } from '@/routes/account';
// Sample data for the company dashboard preview (blueprint §5.5, §5.8). Replace with API data later.
import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    LayoutGrid,
    Settings,
    Users,
    UsersRound,
} from 'lucide-react';
import type { NavItem } from '@/components/dashboard/dashboard-layout';

export const companyNav: NavItem[] = [
    { key: 'overview', label: 'Ringkasan', icon: LayoutGrid },
    { key: 'jobs', label: 'Lowongan', icon: BriefcaseBusiness },
    { key: 'candidates', label: 'Kandidat', icon: Users, badge: 11 },
    { key: 'interviews', label: 'Wawancara', icon: CalendarDays },
    { key: 'team', label: 'Tim Rekrutmen', icon: UsersRound },
];

export const companyAccountNav: NavItem[] = [
    { key: 'company', label: 'Profil Perusahaan', icon: Building2 },
    {
        key: 'settings',
        label: 'Pengaturan',
        icon: Settings,
        href: accountSettings.url(),
    },
];

export const company = { name: 'PT Kreasi Digital', verified: true };

export const companyStats = {
    activeJobs: 3,
    newCandidates: 11,
    interviews: 4,
    hired: 2,
};

export type JobStatus = 'tayang' | 'menunggu' | 'ditutup';

export const jobs: {
    id: number;
    title: string;
    type: string;
    location: string;
    status: JobStatus;
    candidates: number;
    deadline: string;
}[] = [
    {
        id: 1,
        title: 'Magang UI/UX Designer',
        type: 'Magang',
        location: 'Jakarta · Hybrid',
        status: 'tayang',
        candidates: 34,
        deadline: '18 Nov 2026',
    },
    {
        id: 2,
        title: 'Junior Frontend Developer',
        type: 'Penuh waktu',
        location: 'Remote',
        status: 'tayang',
        candidates: 27,
        deadline: '30 Nov 2026',
    },
    {
        id: 3,
        title: 'Magang Data Analyst',
        type: 'Magang',
        location: 'Bandung',
        status: 'tayang',
        candidates: 19,
        deadline: '5 Des 2026',
    },
    {
        id: 4,
        title: 'Product Marketing Intern',
        type: 'Magang',
        location: 'Jakarta',
        status: 'menunggu',
        candidates: 0,
        deadline: '—',
    },
];

export type Stage = 'baru' | 'ditinjau' | 'wawancara' | 'tawaran';

export const stageLabels: Record<Stage, string> = {
    baru: 'Baru',
    ditinjau: 'Ditinjau',
    wawancara: 'Wawancara',
    tawaran: 'Tawaran',
};

export const candidates: {
    id: number;
    name: string;
    job: string;
    match: number;
    skills: string[];
    stage: Stage;
    avatar: string;
}[] = [
    {
        id: 1,
        name: 'Budi Santoso',
        job: 'Junior Frontend Developer',
        match: 91,
        skills: ['React', 'TypeScript', 'Tailwind'],
        stage: 'wawancara',
        avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    },
    {
        id: 2,
        name: 'Rina Putri',
        job: 'Magang UI/UX Designer',
        match: 88,
        skills: ['Figma', 'Riset pengguna'],
        stage: 'ditinjau',
        avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
    {
        id: 3,
        name: 'Rizky Pratama',
        job: 'Magang Data Analyst',
        match: 86,
        skills: ['SQL', 'Python', 'Excel'],
        stage: 'baru',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    {
        id: 4,
        name: 'Sari Wulan',
        job: 'Magang Data Analyst',
        match: 79,
        skills: ['Statistik', 'Power BI'],
        stage: 'baru',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
        id: 5,
        name: 'Dimas Arya',
        job: 'Junior Frontend Developer',
        match: 74,
        skills: ['Vue', 'JavaScript'],
        stage: 'ditinjau',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        id: 6,
        name: 'Ayu Lestari',
        job: 'Magang UI/UX Designer',
        match: 83,
        skills: ['Prototyping', 'Illustrator'],
        stage: 'tawaran',
        avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    },
];

export const interviews = [
    {
        name: 'Budi Santoso',
        job: 'Junior Frontend Developer',
        when: 'Kamis, 5 Nov · 10.00',
        mode: 'Video call',
    },
    {
        name: 'Rina Putri',
        job: 'Magang UI/UX Designer',
        when: 'Jumat, 6 Nov · 13.30',
        mode: 'Kantor Jakarta',
    },
    {
        name: 'Dimas Arya',
        job: 'Junior Frontend Developer',
        when: 'Senin, 9 Nov · 15.00',
        mode: 'Video call',
    },
];
