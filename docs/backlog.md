# Backlog: menyelaraskan dengan blueprint

## Sudah tersambung dengan database

- [x] Registrasi, login, logout, pembatasan akun ditangguhkan, dan akses berdasarkan peran.
- [x] Talent Passport: profil, pendidikan, keterampilan, pengalaman, minat, preferensi, portofolio, serta unggahan CV/sertifikat privat.
- [x] Katalog beasiswa, kelas, dan lowongan; pencarian judul/penyelenggara, filter kategori, jenjang/tingkat, lokasi, tipe kerja, dan tenggat.
- [x] Halaman detail, tautan resmi, tanggal peninjauan, serta penyembunyian peluang belum disetujui atau kedaluwarsa dari katalog.
- [x] Simpan peluang, status aplikasi pribadi, checklist program, tugas, dokumen privat, draft esai, dan riwayat versi.
- [x] Ringkasan peserta, kelengkapan profil, rekomendasi berdasarkan preferensi yang diisi, serta aktivitas/pengingat dalam aplikasi memakai data akun.
- [x] Pengajuan profil mentor ke admin, direktori mentor terverifikasi, jadwal tersedia, permintaan/keputusan sesi, catatan bersama/privat, dan umpan balik setelah sesi selesai.
- [x] Pendaftaran organisasi, keanggotaan dengan akses pemilik/pengelola/peninjau, verifikasi admin, pengajuan/perubahan program ke moderasi, serta penutupan program.
- [x] Pendaftaran langsung ke organisasi yang mengaktifkannya menggunakan persetujuan berbagi data. Catatan pribadi peserta tidak ditampilkan sebagai pendaftar organisasi.
- [x] Tahap pendaftar/kandidat dan jadwal wawancara organisasi kembali terlihat di akun peserta.
- [x] Materi kelas berupa tautan, pendaftaran kelas, dan progres per materi tersimpan; materi ditambahkan pengelola organisasi.
- [x] Pengaturan nama/email/kata sandi dan pengiriman laporan konten ke panel admin.

## Lanjutan blueprint yang masih terbuka

- [ ] Kamus `skills` + `user_skills` yang dikelola admin; keterampilan peserta saat ini berupa isian bebas.
- [ ] Ulasan publik yang dimoderasi. Umpan balik mentoring saat ini hanya terlihat oleh peserta dan mentor terkait.
- [ ] Preferensi notifikasi dan pengiriman email terjadwal. Pengingat saat ini ditampilkan di dashboard dan aktivitas akun.
- [ ] Kuis/asesmen dan penerbitan sertifikat oleh penyelenggara. Peserta dapat menyimpan sertifikat yang sudah dimiliki.
- [ ] Template CV terstruktur, berbagi dokumen dengan izin terpisah, dan komentar revisi pada dokumen.
- [ ] Copilot percakapan/FAQ, AI berbasis model, integrasi LMS/kalender/video, serta API mitra eksternal.
- [x] Halaman Kebijakan Privasi dan Syarat Penggunaan (draf; perlu tinjauan hukum sebelum peluncuran).
- [ ] Ekspor dan penghapusan akun mandiri (saat ini lewat email bantuan), serta halaman bantuan/FAQ publik.
- [ ] MFA admin (ditunda sesuai keputusan pemilik); metode belum dipilih.

## Keputusan implementasi

- Beasiswa, kelas, dan lowongan tetap berada di `opportunities`, dengan field khusus dan checklist persyaratan di JSON `details`.
- Pendaftaran langsung organisasi berada di `organization_applications`, terpisah dari `applications` pribadi peserta.
- Aplikasi memakai Laravel + Inertia React + MySQL. Dokumen disimpan pada disk lokal privat dan diunduh melalui pemeriksaan kepemilikan.
- Alur dan cara mencoba integrasi tercatat di `docs/integrated-flows.md`.
