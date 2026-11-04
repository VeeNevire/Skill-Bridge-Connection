import { LegalLayout, List, Strong } from '@/components/legal/legal-layout';
import type { LegalSection } from '@/components/legal/legal-layout';

type Props = { platformName: string; supportEmail: string };

export default function Privacy({ platformName, supportEmail }: Props) {
    const mail = (
        <a href={`mailto:${supportEmail}`} className="font-medium text-brand hover:underline">
            {supportEmail}
        </a>
    );

    const sections: LegalSection[] = [
        {
            id: 'data',
            title: 'Data yang kami kumpulkan',
            body: (
                <List
                    items={[
                        <>
                            <Strong>Data akun:</Strong> nama, email, dan kata sandi. Kata sandi disimpan dalam bentuk hash dan tidak dapat dibaca siapa pun, termasuk admin.
                        </>,
                        <>
                            <Strong>Talent Passport:</Strong> riwayat pendidikan, keterampilan, pengalaman, minat, preferensi peluang, nomor telepon, bio, dan tautan portofolio yang Anda isi sendiri.
                        </>,
                        <>
                            <Strong>Dokumen:</Strong> CV, sertifikat, dan dokumen pendukung aplikasi yang Anda unggah.
                        </>,
                        <>
                            <Strong>Aktivitas di platform:</Strong> peluang yang disimpan, status dan catatan aplikasi pribadi, tugas dan tenggat, draft esai beserta riwayat versinya, kelas yang diikuti dan progresnya, permintaan sesi mentoring, serta umpan balik.
                        </>,
                        <>
                            <Strong>Data organisasi</Strong> (bagi mitra dan perusahaan): nama, jenis, email, situs, deskripsi organisasi, dan daftar anggota tim.
                        </>,
                        <>
                            <Strong>Data teknis:</Strong> cookie sesi untuk menjaga Anda tetap masuk, alamat IP untuk membatasi percobaan masuk yang mencurigakan, serta catatan tindakan penting admin (audit log).
                        </>,
                    ]}
                />
            ),
        },
        {
            id: 'tujuan',
            title: 'Cara kami menggunakan data',
            body: (
                <List
                    items={[
                        'Membuat dan mengelola akun Anda.',
                        'Menampilkan rekomendasi peluang berdasarkan preferensi di Talent Passport.',
                        'Menjalankan fitur yang Anda gunakan: pelacak aplikasi, checklist, pengingat tenggat, kelas, dan mentoring.',
                        'Menjaga keamanan platform, misalnya mencegah percobaan masuk berulang dan mencatat tindakan admin.',
                        'Memverifikasi mitra dan mentor serta memoderasi konten agar informasi peluang tetap terpercaya.',
                    ]}
                />
            ),
        },
        {
            id: 'berbagi',
            title: 'Kapan data dibagikan',
            body: (
                <>
                    <p>
                        Kami <Strong>tidak menjual</Strong> data pribadi Anda. Data hanya dibagikan dalam situasi berikut:
                    </p>
                    <List
                        items={[
                            <>
                                <Strong>Organisasi yang Anda daftari langsung.</Strong> Nama, email, pesan pendaftaran, dan tautan portofolio dikirim hanya setelah Anda memberi persetujuan pada formulir pendaftaran. Data ini hanya dapat dilihat pemilik dan peninjau organisasi tersebut, bukan pengelola program lain.
                            </>,
                            <>
                                <Strong>Status pelacak pribadi tidak dibagikan.</Strong> Peluang yang Anda simpan, status, catatan, dan draft di pelacak aplikasi hanya terlihat oleh Anda.
                            </>,
                            <>
                                <Strong>Mentor.</Strong> Mentor melihat nama Anda serta topik dan tujuan sesi yang Anda ajukan. Dokumen Anda tidak otomatis dibagikan ke mentor. Catatan pribadi mentor tidak ditampilkan kepada peserta.
                            </>,
                            <>
                                <Strong>Admin platform</Strong> dapat mengakses data seperlunya untuk verifikasi, moderasi, dan penanganan laporan. Tindakan penting admin dicatat dalam audit log.
                            </>,
                            <>
                                <Strong>Penyedia layanan</Strong> yang membantu kami mengoperasikan platform, seperti penyedia server dan pengiriman email, hanya untuk keperluan tersebut.
                            </>,
                            <>
                                <Strong>Kewajiban hukum,</Strong> jika diwajibkan oleh peraturan perundang-undangan atau permintaan resmi aparat yang berwenang.
                            </>,
                        ]}
                    />
                </>
            ),
        },
        {
            id: 'keamanan',
            title: 'Penyimpanan dan keamanan',
            body: (
                <List
                    items={[
                        'Dokumen disimpan di penyimpanan privat, tidak memiliki alamat publik, dan hanya dapat diunduh oleh pemiliknya.',
                        'Akses dibatasi berdasarkan peran (peserta, mentor, mitra, perusahaan, admin) dan keanggotaan organisasi.',
                        'Percobaan masuk dibatasi untuk mencegah penebakan kata sandi, dan akun yang ditangguhkan tidak dapat masuk.',
                        'Pada lingkungan produksi, koneksi ke platform dienkripsi menggunakan HTTPS.',
                    ]}
                />
            ),
        },
        {
            id: 'retensi',
            title: 'Berapa lama data disimpan',
            body: (
                <>
                    <p>Data disimpan selama akun Anda aktif agar fitur dapat berjalan.</p>
                    <List
                        items={[
                            'Dokumen yang Anda hapus langsung dihapus dari penyimpanan.',
                            'Menghapus peluang dari pelacak juga menghapus tugas, draft, dan dokumen yang terkait dengannya.',
                            <>Untuk menghapus seluruh akun beserta datanya, kirim permintaan ke {mail}. Fitur hapus dan ekspor akun mandiri sedang disiapkan.</>,
                        ]}
                    />
                </>
            ),
        },
        {
            id: 'hak',
            title: 'Hak Anda',
            body: (
                <>
                    <p>Sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, Anda berhak untuk:</p>
                    <List
                        items={[
                            'Mengakses data pribadi Anda.',
                            'Memperbaiki data yang tidak akurat, sebagian besar dapat dilakukan langsung di Talent Passport dan Pengaturan Akun.',
                            'Meminta penghapusan data pribadi.',
                            'Menarik persetujuan yang pernah diberikan, termasuk persetujuan berbagi data dengan organisasi.',
                            'Mengajukan keberatan atas pemrosesan data tertentu.',
                        ]}
                    />
                    <p>Ajukan permintaan melalui {mail}. Kami akan menanggapinya dalam waktu yang wajar.</p>
                </>
            ),
        },
        {
            id: 'ai',
            title: 'Kecerdasan buatan (AI)',
            body: (
                <p>
                    Saat ini {platformName} tidak mengirim dokumen atau data pribadi Anda ke layanan AI eksternal. Jika fitur berbasis AI ditambahkan, kami akan menjelaskan data apa yang diproses dan meminta persetujuan Anda terlebih dahulu.
                </p>
            ),
        },
        {
            id: 'anak',
            title: 'Pengguna di bawah umur',
            body: <p>Pengguna yang berusia di bawah 18 tahun wajib menggunakan platform dengan sepengetahuan dan persetujuan orang tua atau wali.</p>,
        },
        {
            id: 'cookie',
            title: 'Cookie',
            body: (
                <p>
                    Kami hanya menggunakan cookie yang diperlukan agar platform berfungsi: cookie sesi untuk menjaga Anda tetap masuk dan cookie keamanan untuk mencegah pemalsuan permintaan. Kami tidak menggunakan cookie pelacak iklan.
                </p>
            ),
        },
        {
            id: 'perubahan',
            title: 'Perubahan kebijakan',
            body: <p>Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan terakhir selalu tercantum di bagian atas halaman, dan perubahan penting akan kami sampaikan melalui platform atau email.</p>,
        },
        {
            id: 'kontak',
            title: 'Hubungi kami',
            body: <p>Pertanyaan tentang kebijakan ini atau data pribadi Anda dapat dikirim ke {mail}.</p>,
        },
    ];

    return (
        <LegalLayout
            title="Kebijakan Privasi"
            intro={
                <p>
                    Kebijakan ini menjelaskan data apa yang dikumpulkan {platformName}, cara kami menggunakannya, dan kendali yang Anda miliki atas data tersebut. Kami hanya mengumpulkan data yang diperlukan untuk menjalankan layanan.
                </p>
            }
            sections={sections}
        />
    );
}
