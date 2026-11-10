import { index as learningIndex } from '@/routes/learning';
import { edit as accountSettings } from '@/routes/account';
// Sample data for the dashboard preview. Replace with real API data once the backend exists.
import {
    BookOpen,
    BriefcaseBusiness,
    Building2,
    FilePen,
    GraduationCap,
    IdCard,
    LayoutGrid,
    Settings,
    Users,
} from 'lucide-react';
import type { NavItem } from '@/components/dashboard/dashboard-layout';
import { edit as passportEdit } from '@/routes/passport';
import { dashboard } from '@/routes';
import { index as mentoringIndex } from '@/routes/mentoring';
import { index as catalog } from '@/routes/catalog';
import { index as applicationsIndex } from '@/routes/applications';

// Profile fields the backend does not provide yet; name and email come from the authenticated user.
export const currentUser = {
    role: 'Peserta',
    profileCompletion: 85,
};

export const navItems: NavItem[] = [
    {
        key: 'overview',
        label: 'Ringkasan',
        icon: LayoutGrid,
        href: dashboard.url(),
    },
    {
        key: 'passport',
        label: 'Talent Passport',
        icon: IdCard,
        href: passportEdit.url(),
    },
    {
        key: 'scholarship',
        label: 'Beasiswa',
        icon: GraduationCap,
        href: catalog.url('beasiswa'),
    },
    {
        key: 'studio',
        label: 'Application Studio',
        icon: FilePen,
        href: applicationsIndex.url(),
    },
    {
        key: 'academy',
        label: 'Belajar',
        icon: BookOpen,
        href: learningIndex.url(),
    },
    {
        key: 'internship',
        label: 'Magang',
        icon: Building2,
        href: catalog.url('magang'),
    },
    {
        key: 'career',
        label: 'Karier',
        icon: BriefcaseBusiness,
        href: catalog.url('lowongan'),
    },
    { key: 'mentor', label: 'Mentor', icon: Users, href: mentoringIndex.url() },
];

export const accountNavItems: NavItem[] = [
    {
        key: 'settings',
        label: 'Pengaturan',
        icon: Settings,
        href: accountSettings.url(),
    },
];

export const stats = [
    { label: 'Aplikasi aktif', value: 5, delta: '+2 bulan ini', tone: 'brand' },
    { label: 'Tenggat 7 hari', value: 2, delta: 'Segera siapkan', tone: 'cta' },
    { label: 'Kelas berjalan', value: 3, delta: '68% rata-rata', tone: 'sky' },
    { label: 'Sesi mentor', value: 1, delta: 'Kamis, 14.00', tone: 'emerald' },
] as const;

export type Stage =
    | 'Ingin daftar'
    | 'Persiapan'
    | 'Dikirim'
    | 'Seleksi'
    | 'Diterima';
export type OpportunityType = 'Beasiswa' | 'Magang' | 'Pekerjaan';

export const stages: Stage[] = [
    'Ingin daftar',
    'Persiapan',
    'Dikirim',
    'Seleksi',
    'Diterima',
];

export const applications: {
    id: number;
    name: string;
    organizer: string;
    type: OpportunityType;
    stage: Stage;
    deadline: string;
    checklist: { done: number; total: number };
}[] = [
    {
        id: 1,
        name: 'Beasiswa Magister Luar Negeri',
        organizer: 'Yayasan Cendekia Nusantara',
        type: 'Beasiswa',
        stage: 'Seleksi',
        deadline: '12 Nov 2026',
        checklist: { done: 8, total: 8 },
    },
    {
        id: 2,
        name: 'Magang UI/UX Designer',
        organizer: 'PT Kreasi Digital',
        type: 'Magang',
        stage: 'Dikirim',
        deadline: '18 Nov 2026',
        checklist: { done: 5, total: 5 },
    },
    {
        id: 3,
        name: 'Beasiswa Prestasi S1',
        organizer: 'Universitas Mitra',
        type: 'Beasiswa',
        stage: 'Persiapan',
        deadline: '05 Nov 2026',
        checklist: { done: 4, total: 7 },
    },
    {
        id: 4,
        name: 'Program Riset Musim Panas',
        organizer: 'Lembaga Riset Terbuka',
        type: 'Beasiswa',
        stage: 'Persiapan',
        deadline: '08 Nov 2026',
        checklist: { done: 2, total: 6 },
    },
    {
        id: 5,
        name: 'Junior Frontend Developer',
        organizer: 'Startup Teknologi',
        type: 'Pekerjaan',
        stage: 'Ingin daftar',
        deadline: '30 Nov 2026',
        checklist: { done: 0, total: 4 },
    },
];

export const deadlines = [
    {
        title: 'Esai motivasi',
        context: 'Beasiswa Prestasi S1',
        date: '05 Nov',
        daysLeft: 3,
    },
    {
        title: 'Surat rekomendasi',
        context: 'Program Riset Musim Panas',
        date: '08 Nov',
        daysLeft: 6,
    },
    {
        title: 'Wawancara tahap 2',
        context: 'Beasiswa Magister Luar Negeri',
        date: '12 Nov',
        daysLeft: 10,
    },
];

export const profileChecklist = [
    { label: 'Data diri & kontak', done: true },
    { label: 'Riwayat pendidikan', done: true },
    { label: 'Skill & tingkat penguasaan', done: true },
    { label: 'Sertifikat pelatihan', done: false },
    { label: 'Tautan portofolio', done: false },
];

export const recommendations = [
    {
        id: 1,
        name: 'Beasiswa Pemimpin Muda',
        organizer: 'Yayasan Pendidikan Bangsa',
        level: 'S2',
        location: 'Dalam negeri',
        deadline: '20 Des 2026',
        match: 92,
        reason: 'Sesuai jenjang, bidang studi, dan pengalaman organisasi Anda.',
    },
    {
        id: 2,
        name: 'Beasiswa Riset Teknologi',
        organizer: 'Konsorsium Kampus Teknik',
        level: 'S2',
        location: 'Luar negeri',
        deadline: '15 Jan 2027',
        match: 84,
        reason: 'Cocok dengan skill data & proyek riset di profil Anda.',
    },
    {
        id: 3,
        name: 'Program Pertukaran Pelajar',
        organizer: 'Jejaring Universitas Asia',
        level: 'S1',
        location: 'Luar negeri',
        deadline: '28 Feb 2027',
        match: 71,
        reason: 'Butuh sertifikat bahasa — lengkapi untuk menaikkan kecocokan.',
    },
];

export const courses = [
    {
        title: 'Menulis Esai Beasiswa yang Kuat',
        category: 'Persiapan aplikasi',
        progress: 80,
        lessons: '8/10 materi',
        color: '#8b5cf6',
    },
    {
        title: 'Dasar Analisis Data',
        category: 'Skill teknis',
        progress: 55,
        lessons: '11/20 materi',
        color: '#0ea5e9',
    },
    {
        title: 'Public Speaking untuk Wawancara',
        category: 'Soft skill',
        progress: 30,
        lessons: '3/10 materi',
        color: '#f59e0b',
    },
];

export const mentorSession = {
    mentor: 'Arief Pratama',
    expertise: 'Mentor Karier & Esai',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    topic: 'Review esai motivasi beasiswa',
    date: 'Kamis, 5 Nov 2026',
    time: '14.00 – 15.00 WIB',
};

export const notifications = [
    {
        title: 'Tenggat esai motivasi 3 hari lagi',
        time: '1 jam lalu',
        unread: true,
    },
    {
        title: 'Arief Pratama menerima permintaan sesi Anda',
        time: '3 jam lalu',
        unread: true,
    },
    {
        title: '2 beasiswa baru cocok dengan profil Anda',
        time: 'Kemarin',
        unread: false,
    },
];
