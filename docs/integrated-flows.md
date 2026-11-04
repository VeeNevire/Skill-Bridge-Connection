# Alur integrasi SkillBridge Connect

## Peserta

1. Daftar/masuk, kemudian isi Talent Passport. Isian dan dokumen CV/sertifikat disimpan untuk akun sendiri.
2. Pilih katalog Beasiswa/Karier, atau Cari Kelas dari menu Belajar. Buka judul untuk melihat detail, sumber resmi, dan persyaratan.
3. Simpan peluang untuk membuat tracker pribadi. Persyaratan program yang ditulis pengelola menjadi checklist awal.
4. Application Studio menyimpan status pribadi, tugas/tenggat, dokumen privat, draft, dan riwayat versi. Status ini tidak dikirim ke organisasi.
5. Jika organisasi mengaktifkan pendaftaran langsung, formulir terpisah meminta persetujuan berbagi nama, email, pesan, dan tautan portofolio. Tahap organisasi/wawancara tampil di Application Studio.
6. Ikuti kelas dari halaman detail. Menu Belajar menampilkan kelas diikuti; tandai materi selesai untuk menyimpan progres.
7. Menu Mentor menampilkan mentor disetujui dengan peran aktif, jadwal tersedia, permintaan, hasil sesi, dan catatan yang dibagikan. Dokumen peserta tidak otomatis dibagikan ke mentor.
8. Ringkasan dan aktivitas akun mengambil data dari aplikasi, tugas, kelas, dan sesi. Persentase profil dihitung dari bagian profil dasar yang sudah diisi.

## Mentor

1. Peserta mengajukan profil dari menu Mentor. Admin memverifikasi di panel Verifikasi; persetujuan memberi peran Mentor.
2. Mentor menambahkan jadwal. Jadwal bertumpang tindih ditolak; satu jadwal hanya dapat dipesan satu permintaan aktif.
3. Permintaan peserta muncul pada dashboard mentor. Mentor menerima atau menolak; penolakan membuka kembali jadwal yang masih tersedia.
4. Setelah waktu sesi berlalu, mentor dapat menandainya selesai. Peserta dapat memberi penilaian dan umpan balik.
5. Catatan pribadi mentor disembunyikan dari respons peserta. Catatan bersama terlihat pada sesi peserta.

## Mitra dan perusahaan

1. Akun mendaftarkan organisasi melalui Pengaturan Akun. Akun memperoleh akses portal sebagai pemilik; organisasi masih menunggu verifikasi.
2. Admin memverifikasi organisasi. Pembuatan/pengajuan ulang program membutuhkan organisasi yang disetujui.
3. Pemilik menambahkan akun anggota yang sudah terdaftar sebagai pengelola program atau peninjau pendaftar. Hanya pemilik dapat mengelola anggota/profil organisasi.
4. Mitra mengajukan beasiswa/kelas; perusahaan mengajukan lowongan. Program dan perubahan program masuk moderasi admin.
5. Program disetujui tampil di katalog selama belum kedaluwarsa. Perubahan identitas organisasi memerlukan verifikasi ulang dan menahan kembali program terkait.
6. Formulir pendaftaran langsung hanya tersedia jika organisasi mengaktifkannya. Portal hanya menampilkan kiriman dengan persetujuan tersebut.
7. Pemilik/peninjau memperbarui tahap dan jadwal wawancara. Peserta melihat pembaruannya di Application Studio.
8. Pemilik/pengelola menambahkan materi pada kelas. Peserta yang mengikuti kelas dapat membuka materi dan menyimpan progres sendiri.

## Pemeriksaan yang dilakukan

Feature test mencakup alur lintas peran, pembatasan antarpeserta/organisasi, privasi catatan dan berkas, moderasi, persetujuan pendaftaran, benturan jadwal, serta query yang tetap konstan saat data bertambah. Pemeriksaan tipe TypeScript, PHPStan, dan Pint mengikuti AGENTS.md.

## Batas integrasi saat ini

Lihat `docs/backlog.md` untuk fitur lanjutan. Tidak ada layanan email/video/LMS/AI eksternal yang dikonfigurasi oleh pekerjaan ini. Data demo pada landing page tetap merupakan ilustrasi; dashboard operasional membaca database.
