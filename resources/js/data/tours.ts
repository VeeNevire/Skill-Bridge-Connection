import type { UserRole } from '@/types';

/**
 * One step of a guided tour. `target` matches a `data-tour` attribute in the dashboard layout
 * (`nav-<menu key>`, `search`, `notifications`, `account`, `role-switcher`, `help`).
 * Without a target the card is shown in the middle of the screen.
 * `optional` steps are dropped when their target is not on the page (e.g. a hidden menu).
 */
export type TourStep = { target?: string; title: string; body: string; optional?: boolean };

const topbar: TourStep[] = [
    { target: 'search', title: 'Pencarian cepat', body: 'Ketik kata kunci lalu tekan Enter untuk mencari langsung dari halaman yang sedang Anda buka.' },
    { target: 'role-switcher', title: 'Ganti tampilan peran', body: 'Akun Anda punya lebih dari satu peran. Pindah antar-dashboard dari sini.', optional: true },
    { target: 'notifications', title: 'Notifikasi', body: 'Tenggat, perubahan status, dan aktivitas penting muncul di sini.' },
    { target: 'account', title: 'Akun Anda', body: 'Lihat akun yang sedang dipakai dan keluar dari platform.' },
];

const finish = (body: string): TourStep => ({ target: 'help', title: 'Selesai, Anda siap mulai!', body: `${body} Tur ini bisa dibuka lagi kapan saja lewat tombol Panduan.` });

export const tours: Record<UserRole, TourStep[]> = {
    peserta: [
        { title: 'Selamat datang di SkillBridge Connect', body: 'Kami tunjukkan menu-menu utama dalam satu menit. Tekan Lanjut, atau Lewati jika sudah paham.' },
        { target: 'nav-overview', title: 'Ringkasan', body: 'Halaman utama Anda: rekomendasi peluang, tenggat terdekat, dan sesi mentoring berikutnya.' },
        { target: 'nav-passport', title: 'Talent Passport', body: 'Profil Anda: pendidikan, skill, pengalaman, dan dokumen. Makin lengkap, makin tepat rekomendasinya.' },
        { target: 'nav-scholarship', title: 'Beasiswa', body: 'Cari beasiswa berdasarkan jenjang, lokasi, dan tenggat. Simpan yang menarik ke pelacak.' },
        { target: 'nav-studio', title: 'Application Studio', body: 'Pelacak pribadi untuk setiap peluang: status, checklist dokumen, draft esai, dan tenggat.' },
        { target: 'nav-academy', title: 'Belajar', body: 'Kelas yang Anda ikuti beserta progres setiap materinya.' },
        { target: 'nav-career', title: 'Karier', body: 'Lowongan kerja dan magang yang sudah diverifikasi.' },
        { target: 'nav-mentor', title: 'Mentor', body: 'Temukan mentor terverifikasi, pilih jadwal kosong, dan ajukan sesi bimbingan.' },
        { target: 'nav-settings', title: 'Pengaturan', body: 'Ubah nama, email, kata sandi, atau daftarkan organisasi Anda.' },
        ...topbar,
        finish('Langkah pertama yang disarankan: lengkapi Talent Passport.'),
    ],
    mentor: [
        { title: 'Selamat datang, Mentor', body: 'Kami tunjukkan cara mengelola bimbingan di SkillBridge Connect.' },
        { target: 'nav-overview', title: 'Ringkasan', body: 'Sesi terdekat dan permintaan yang menunggu jawaban Anda.' },
        { target: 'nav-requests', title: 'Permintaan Sesi', body: 'Peserta yang ingin dibimbing. Terima atau tolak; jadwal yang ditolak terbuka kembali.' },
        { target: 'nav-schedule', title: 'Jadwal', body: 'Tambahkan slot waktu kosong agar peserta bisa memesannya. Jadwal yang bertabrakan otomatis ditolak.' },
        { target: 'nav-mentees', title: 'Peserta Bimbingan', body: 'Sesi yang sudah diterima atau selesai bersama peserta Anda.' },
        { target: 'nav-notes', title: 'Catatan Sesi', body: 'Catatan bersama terlihat oleh peserta; catatan pribadi hanya untuk Anda.' },
        { target: 'nav-feedback', title: 'Umpan Balik', body: 'Penilaian dan komentar peserta setelah sesi selesai.' },
        { target: 'nav-profile', title: 'Profil Mentor', body: 'Bidang keahlian, pengalaman, dan bio yang dilihat peserta.' },
        ...topbar,
        finish('Mulailah dengan menambahkan jadwal kosong di menu Jadwal.'),
    ],
    mitra: [
        { title: 'Selamat datang, Mitra Pendidikan', body: 'Kami tunjukkan cara mempublikasikan program dan mengelola pendaftar.' },
        { target: 'nav-overview', title: 'Ringkasan', body: 'Status verifikasi organisasi dan ringkasan program serta pendaftar.' },
        { target: 'nav-programs', title: 'Program', body: 'Ajukan beasiswa atau kelas. Setiap program ditinjau admin sebelum tayang di katalog.' },
        { target: 'nav-applicants', title: 'Pendaftar', body: 'Peserta yang mendaftar langsung dengan persetujuan berbagi data. Perbarui tahap seleksinya di sini.', optional: true },
        { target: 'nav-performance', title: 'Performa', body: 'Ringkasan jumlah program dan pendaftar per tahap.' },
        { target: 'nav-team', title: 'Anggota Tim', body: 'Undang rekan sebagai pengelola program atau peninjau pendaftar.' },
        { target: 'nav-organization', title: 'Profil Organisasi', body: 'Data organisasi. Mengubah nama, email, atau situs memerlukan verifikasi ulang.' },
        ...topbar,
        finish('Pastikan organisasi Anda sudah terverifikasi, lalu ajukan program pertama.'),
    ],
    perusahaan: [
        { title: 'Selamat datang, Perusahaan', body: 'Kami tunjukkan cara memasang lowongan dan mengelola kandidat.' },
        { target: 'nav-overview', title: 'Ringkasan', body: 'Status verifikasi perusahaan dan ringkasan lowongan serta kandidat.' },
        { target: 'nav-jobs', title: 'Lowongan', body: 'Pasang lowongan kerja atau magang. Setiap lowongan ditinjau admin sebelum tayang.' },
        { target: 'nav-candidates', title: 'Kandidat', body: 'Pelamar yang mengirim data dengan persetujuan. Geser mereka ke tahap berikutnya.', optional: true },
        { target: 'nav-interviews', title: 'Wawancara', body: 'Kandidat yang sudah dijadwalkan wawancara beserta waktu dan lokasinya.', optional: true },
        { target: 'nav-team', title: 'Tim Rekrutmen', body: 'Undang rekan sebagai pengelola lowongan atau peninjau kandidat.' },
        { target: 'nav-company', title: 'Profil Perusahaan', body: 'Data perusahaan. Mengubah nama, email, atau situs memerlukan verifikasi ulang.' },
        ...topbar,
        finish('Pastikan perusahaan Anda sudah terverifikasi, lalu pasang lowongan pertama.'),
    ],
    admin: [
        { title: 'Selamat datang di Panel Admin', body: 'Kami tunjukkan alat untuk menjaga platform tetap aman dan terpercaya.' },
        { target: 'nav-/admin', title: 'Ringkasan', body: 'Kondisi platform hari ini: antrean verifikasi, moderasi, laporan, dan pengguna baru.' },
        { target: 'nav-/admin/pengguna', title: 'Pengguna', body: 'Tambah, ubah, tangguhkan, atau hapus akun, serta atur perannya.' },
        { target: 'nav-/admin/verifikasi', title: 'Verifikasi', body: 'Tinjau mitra dan mentor baru sebelum mereka bisa mempublikasikan atau membimbing.' },
        { target: 'nav-/admin/moderasi', title: 'Moderasi Konten', body: 'Setujui atau tolak beasiswa, kelas, dan lowongan sebelum tayang di katalog.' },
        { target: 'nav-/admin/laporan', title: 'Laporan', body: 'Konten yang dilaporkan pengguna, misalnya dugaan penipuan atau info kedaluwarsa.' },
        { target: 'nav-/admin/kategori', title: 'Kategori', body: 'Kelompokkan peluang agar mudah dicari.' },
        { target: 'nav-/admin/audit-log', title: 'Audit Log', body: 'Catatan setiap tindakan penting admin, untuk transparansi dan penelusuran.' },
        { target: 'nav-/admin/analitik', title: 'Analitik', body: 'Tren pendaftaran pengguna, konten, dan laporan.' },
        { target: 'nav-/admin/pengaturan', title: 'Pengaturan', body: 'Nama platform, email bantuan, pengumuman, dan kebijakan pendaftaran.' },
        ...topbar,
        finish('Mulailah dari antrean Verifikasi dan Moderasi.'),
    ],
};
