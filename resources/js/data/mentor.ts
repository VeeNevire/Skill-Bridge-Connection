import { edit as accountSettings } from '@/routes/account';
// Sample data for the mentor dashboard preview (blueprint §5.6, §6.3). Replace with API data later.
import {
    CalendarDays,
    LayoutGrid,
    MessageSquareText,
    NotebookPen,
    Settings,
    Star,
    UserRound,
    Users,
} from 'lucide-react';
import type { NavItem } from '@/components/dashboard/dashboard-layout';

export const mentorNav: NavItem[] = [
    { key: 'overview', label: 'Ringkasan', icon: LayoutGrid },
    {
        key: 'requests',
        label: 'Permintaan Sesi',
        icon: MessageSquareText,
        badge: 3,
    },
    { key: 'schedule', label: 'Jadwal', icon: CalendarDays },
    { key: 'mentees', label: 'Peserta Bimbingan', icon: Users },
    { key: 'notes', label: 'Catatan Sesi', icon: NotebookPen },
    { key: 'feedback', label: 'Umpan Balik', icon: Star },
];

export const mentorAccountNav: NavItem[] = [
    { key: 'profile', label: 'Profil Mentor', icon: UserRound },
    {
        key: 'settings',
        label: 'Pengaturan',
        icon: Settings,
        href: accountSettings.url(),
    },
];

export const mentorStats = {
    newRequests: 3,
    sessionsThisWeek: 5,
    activeMentees: 12,
    rating: 4.9,
};

export const sessionRequests = [
    {
        id: 1,
        name: 'Nadia Rahma',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        topic: 'Review esai motivasi beasiswa S2',
        goal: 'Tenggat 12 Nov, ingin masukan struktur & narasi.',
        preferred: 'Kamis, 14.00',
        requestedAt: '2 jam lalu',
    },
    {
        id: 2,
        name: 'Dimas Arya',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        topic: 'Persiapan wawancara magang',
        goal: 'Latihan menjawab pertanyaan perilaku (STAR).',
        preferred: 'Jumat, 10.00',
        requestedAt: '5 jam lalu',
    },
    {
        id: 3,
        name: 'Sari Wulan',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        topic: 'Memilih jurusan S2 luar negeri',
        goal: 'Bingung antara Data Science dan Public Policy.',
        preferred: 'Fleksibel',
        requestedAt: 'Kemarin',
    },
];

export const schedule = [
    {
        day: 'Sen',
        date: 2,
        sessions: [] as { time: string; name: string; topic: string }[],
    },
    {
        day: 'Sel',
        date: 3,
        sessions: [
            { time: '19.00', name: 'Rizky Pratama', topic: 'Review CV' },
        ],
    },
    { day: 'Rab', date: 4, sessions: [] },
    {
        day: 'Kam',
        date: 5,
        sessions: [
            { time: '14.00', name: 'Nadia Rahma', topic: 'Esai motivasi' },
            { time: '16.00', name: 'Ayu Lestari', topic: 'Rencana studi' },
        ],
    },
    {
        day: 'Jum',
        date: 6,
        sessions: [{ time: '10.00', name: 'Budi Santoso', topic: 'Wawancara' }],
    },
    {
        day: 'Sab',
        date: 7,
        sessions: [
            {
                time: '09.00',
                name: 'Kelas kelompok',
                topic: 'Strategi beasiswa',
            },
        ],
    },
    { day: 'Min', date: 8, sessions: [] },
];

export const mentees = [
    {
        name: 'Nadia Rahma',
        goal: 'Beasiswa Magister Luar Negeri',
        progress: 75,
        sessions: 4,
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
        name: 'Rizky Pratama',
        goal: 'Magang Data Analyst',
        progress: 50,
        sessions: 3,
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    {
        name: 'Ayu Lestari',
        goal: 'Beasiswa Prestasi S1',
        progress: 30,
        sessions: 2,
        avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    },
    {
        name: 'Budi Santoso',
        goal: 'Junior Frontend Developer',
        progress: 60,
        sessions: 5,
        avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    },
];

export const recentNotes = [
    {
        mentee: 'Rizky Pratama',
        date: '3 Nov',
        summary:
            'CV sudah rapi; tambahkan hasil kuantitatif di proyek analisis penjualan.',
        shared: true,
    },
    {
        mentee: 'Budi Santoso',
        date: '1 Nov',
        summary:
            'Latihan wawancara teknis — perlu memperdalam konsep state management.',
        shared: false,
    },
];

export const feedback = [
    {
        name: 'Ayu Lestari',
        rating: 5,
        comment: 'Penjelasannya runtut, saya jadi tahu harus mulai dari mana.',
        date: '2 hari lalu',
    },
    {
        name: 'Rizky Pratama',
        rating: 5,
        comment: 'Masukan CV-nya sangat spesifik dan langsung bisa dipakai.',
        date: '4 hari lalu',
    },
    {
        name: 'Dewi Kartika',
        rating: 4,
        comment:
            'Sesi bermanfaat, semoga durasinya bisa sedikit lebih panjang.',
        date: 'Minggu lalu',
    },
];

export const availability = { slotsOpen: 6, nextOpen: 'Rabu, 4 Nov · 19.00' };
