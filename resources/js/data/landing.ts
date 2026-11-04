import { index as catalog } from '@/routes/catalog';
const unsplash = (id: string, w = 320, h = 400) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=faces&auto=format&q=70`;

export const brand = {
    name: 'SkillBridge',
    fullName: 'SkillBridge Connect',
    tagline: 'One Platform, Unlimited Opportunities',
};

export const navLinks = [
    { label: 'Beasiswa', href: catalog.url('beasiswa') },
    { label: 'Belajar', href: catalog.url('kelas') },
    { label: 'Modul', href: '#modul' },
    { label: 'Karier', href: catalog.url('lowongan') },
];

export const hero = {
    title: 'Satu platform, peluang tanpa batas',
    subtitle:
        'Temukan beasiswa, tingkatkan skill, dapatkan mentor, dan raih karier impian — semuanya dalam satu ekosistem yang terarah.',
    cta: 'Mulai Sekarang',
    avatars: [
        unsplash('1500648767791-00dcc994a43e', 160, 160),
        unsplash('1494790108377-be9c29b29330', 160, 160),
    ],
};

export const talent = {
    title: 'Satu profil untuk semua peluang',
    subtitle:
        'Talent Passport merangkum pendidikan, skill, sertifikat, pengalaman, dan portofolio Anda — dasar rekomendasi beasiswa dan karier yang relevan.',
    cta: 'Buat Profil',
    columns: [
        [
            unsplash('1531123897727-8f129e1688ce'),
            unsplash('1500648767791-00dcc994a43e'),
            unsplash('1517841905240-472988babdf9'),
        ],
        [
            unsplash('1494790108377-be9c29b29330'),
            unsplash('1506794778202-cad84cf45f1d'),
            unsplash('1544005313-94ddf0286df2'),
        ],
        [
            unsplash('1507003211169-0a1dd7228f2d'),
            unsplash('1438761681033-6461ffad8d80'),
            unsplash('1539571696357-5a69c17a67c6'),
        ],
        [
            unsplash('1534528741775-53994a69daeb'),
            unsplash('1472099645785-5658abf4ff4e'),
            unsplash('1519085360753-af0119f7cbe7'),
        ],
    ],
};

export type ApplicationStatus = 'Persiapan' | 'Dikirim' | 'Seleksi';

export const bento = {
    title: 'Dibuat untuk setiap peran',
    subtitle:
        'Pelajar, mentor, mitra pendidikan, dan perusahaan terhubung dalam satu ekosistem tanpa harus berpindah-pindah platform.',
    cards: {
        participant: {
            title: 'Untuk peserta & pelajar',
            body: 'Ikuti kelas di Skill Academy, pantau progres belajar, dan simpan hasilnya di profil.',
        },
        partner: {
            title: 'Untuk mitra pendidikan',
            body: 'Publikasikan program beasiswa dan pantau pendaftar sesuai hak akses.',
        },
        mentor: {
            title: 'Untuk mentor',
            body: 'Kelola permintaan sesi, jadwal, dan catatan bimbingan peserta.',
        },
        tracker: {
            title: 'Semua aplikasi dalam satu tracker',
            body: 'Checklist dokumen, tenggat, dan status pendaftaran beasiswa maupun lamaran kerja.',
        },
        company: {
            title: 'Untuk perusahaan',
            body: 'Publikasikan magang dan lowongan, lalu temukan kandidat yang relevan.',
        },
    },
    reportLabel: 'Progres Belajar',
    toasts: [
        'Tenggat beasiswa 3 hari lagi',
        'Checklist dokumen 80% siap',
        'Sesi mentor dikonfirmasi',
    ],
    applications: [
        {
            name: 'Beasiswa S2 Luar Negeri',
            type: 'Beasiswa',
            status: 'Seleksi' as ApplicationStatus,
        },
        {
            name: 'Magang UI/UX Designer',
            type: 'Magang',
            status: 'Dikirim' as ApplicationStatus,
        },
        {
            name: 'Beasiswa Prestasi S1',
            type: 'Beasiswa',
            status: 'Persiapan' as ApplicationStatus,
        },
    ],
    orbit: [
        'https://randomuser.me/api/portraits/women/12.jpg',
        'https://randomuser.me/api/portraits/men/22.jpg',
        'https://randomuser.me/api/portraits/women/33.jpg',
        'https://randomuser.me/api/portraits/men/45.jpg',
        'https://randomuser.me/api/portraits/women/57.jpg',
        'https://randomuser.me/api/portraits/men/61.jpg',
        'https://randomuser.me/api/portraits/women/72.jpg',
        'https://randomuser.me/api/portraits/men/83.jpg',
    ],
};

export type ModuleKey =
    | 'passport'
    | 'scholarship'
    | 'studio'
    | 'academy'
    | 'career'
    | 'mentor'
    | 'copilot';

export const modules: {
    title: string;
    items: {
        key: ModuleKey;
        name: string;
        description: string;
        color: string;
    }[];
} = {
    title: 'Tujuh modul, satu ekosistem',
    items: [
        {
            key: 'passport',
            name: 'Talent Passport',
            description: 'Profil kompetensi digital Anda',
            color: '#8b5cf6',
        },
        {
            key: 'scholarship',
            name: 'Scholarship Hub',
            description: 'Cari & kelola informasi beasiswa',
            color: '#f04438',
        },
        {
            key: 'studio',
            name: 'Application Studio',
            description: 'Siapkan esai, CV, dan dokumen',
            color: '#f59e0b',
        },
        {
            key: 'academy',
            name: 'Skill Academy',
            description: 'Kelas & pelatihan keterampilan',
            color: '#0ea5e9',
        },
        {
            key: 'career',
            name: 'Career Connect',
            description: 'Magang & lowongan pekerjaan',
            color: '#10b981',
        },
        {
            key: 'mentor',
            name: 'Mentor Network',
            description: 'Sesi bimbingan dengan mentor',
            color: '#ec4899',
        },
        {
            key: 'copilot',
            name: 'Opportunity Copilot',
            description: 'Asisten perencanaan langkah Anda',
            color: '#6366f1',
        },
    ],
};

export const testimonials = {
    title: 'Kata Mereka',
    subtitle:
        'Cerita dari peserta, mentor, dan mitra yang tumbuh bersama SkillBridge Connect.',
    items: [
        {
            name: 'Nadia Rahma',
            role: 'Penerima Beasiswa S2',
            avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
            rating: 5,
            quote: '“Checklist dan pengingat tenggat membuat persiapan beasiswa saya jauh lebih teratur. Saya tidak lagi takut ada dokumen yang terlewat.”',
        },
        {
            name: 'Arief Pratama',
            role: 'Mentor Karier & Esai',
            avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
            rating: 5,
            quote: '“Permintaan sesi dan catatan bimbingan tersusun rapi, jadi saya bisa fokus memberi masukan yang benar-benar membantu peserta.”',
        },
        {
            name: 'Dewi Kartika',
            role: 'Talent Acquisition, Mitra Perusahaan',
            avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
            rating: 5,
            quote: '“Talent Passport memperlihatkan skill dan portofolio kandidat dengan jelas, sehingga kami lebih cepat menemukan peserta magang yang cocok.”',
        },
    ],
};

export const footer = {
    tagline:
        'Ekosistem digital untuk mengembangkan potensi dan mengakses peluang pendidikan serta karier secara terarah.',
    columns: [
        {
            title: 'Platform',
            links: ['Beasiswa', 'Belajar', 'Karier', 'Mentor'],
        },
        { title: 'Untuk', links: ['Peserta', 'Mentor', 'Mitra', 'Perusahaan'] },
        { title: 'Sumber Daya', links: ['Tentang', 'FAQ', 'Pusat Bantuan'] },
    ],
    disclaimer:
        'SkillBridge Connect adalah platform independen dan bukan layanan resmi LPDP, KIP Kuliah, atau lembaga pemerintah. Informasi program resmi merujuk pada kanal penyelenggara masing-masing.',
};
