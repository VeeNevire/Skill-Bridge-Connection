import { Link } from '@inertiajs/react';
import { LegalLayout, List, Strong } from '@/components/legal/legal-layout';
import type { LegalSection } from '@/components/legal/legal-layout';
import legal from '@/routes/legal';

type Props = { platformName: string; supportEmail: string };

export default function Terms({ platformName, supportEmail }: Props) {
    const mail = (
        <a href={`mailto:${supportEmail}`} className="font-medium text-brand hover:underline">
            {supportEmail}
        </a>
    );

    const sections: LegalSection[] = [
        {
            id: 'penerimaan',
            title: 'Penerimaan ketentuan',
            body: (
                <p>
                    Dengan membuat akun atau menggunakan {platformName}, Anda menyetujui Syarat Penggunaan ini dan{' '}
                    <Link href={legal.privacy()} className="font-medium text-brand hover:underline">
                        Kebijakan Privasi
                    </Link>
                    . Jika tidak setuju, mohon tidak menggunakan platform.
                </p>
            ),
        },
        {
            id: 'layanan',
            title: 'Tentang layanan',
            body: (
                <>
                    <p>{platformName} membantu Anda menemukan beasiswa, kelas, mentor, dan peluang karier, serta mengelola persiapan aplikasi dalam satu tempat.</p>
                    <List
                        items={[
                            <>
                                {platformName} adalah platform independen dan <Strong>bukan layanan resmi LPDP, KIP Kuliah, atau lembaga pemerintah</Strong>. Informasi program resmi selalu merujuk pada kanal penyelenggara masing-masing.
                            </>,
                            <>
                                Kami <Strong>bukan pengambil keputusan seleksi</Strong> dan tidak menjamin Anda diterima di program mana pun. Periksa kembali informasi penting ke sumber resmi.
                            </>,
                            'Status di pelacak aplikasi adalah catatan pribadi Anda dan tidak terhubung dengan sistem seleksi penyelenggara, kecuali untuk pendaftaran langsung yang diaktifkan organisasi.',
                        ]}
                    />
                </>
            ),
        },
        {
            id: 'akun',
            title: 'Akun Anda',
            body: (
                <List
                    items={[
                        'Gunakan data yang benar dan perbarui bila berubah.',
                        'Jaga kerahasiaan kata sandi. Anda bertanggung jawab atas aktivitas yang terjadi melalui akun Anda.',
                        'Satu akun dapat memiliki beberapa peran (misalnya peserta sekaligus mentor) sesuai izin yang diberikan.',
                        'Segera hubungi kami jika Anda menduga akun Anda digunakan tanpa izin.',
                    ]}
                />
            ),
        },
        {
            id: 'peran',
            title: 'Ketentuan per peran',
            body: (
                <List
                    items={[
                        <>
                            <Strong>Peserta:</Strong> gunakan fitur untuk keperluan pendidikan dan karier pribadi. Kirim pendaftaran langsung ke organisasi hanya dengan informasi yang benar.
                        </>,
                        <>
                            <Strong>Mentor:</Strong> profil mentor diverifikasi admin sebelum aktif. Jaga kerahasiaan informasi peserta dan gunakan hanya untuk keperluan bimbingan.
                        </>,
                        <>
                            <Strong>Mitra pendidikan dan perusahaan:</Strong> organisasi harus diverifikasi sebelum mempublikasikan program. Setiap program dan perubahannya dimoderasi admin. Data pendaftar hanya boleh digunakan untuk proses seleksi program terkait dan tidak boleh dialihkan atau dijual kepada pihak lain.
                        </>,
                    ]}
                />
            ),
        },
        {
            id: 'konten',
            title: 'Konten dan moderasi',
            body: (
                <List
                    items={[
                        'Informasi peluang harus akurat, terkini, dan menyertakan tautan resmi penyelenggara.',
                        'Admin berhak menolak, meminta perbaikan, atau menurunkan konten yang tidak memenuhi ketentuan.',
                        'Pengguna dapat melaporkan konten yang mencurigakan, kedaluwarsa, atau menyesatkan melalui tombol laporan di halaman peluang.',
                    ]}
                />
            ),
        },
        {
            id: 'larangan',
            title: 'Hal yang dilarang',
            body: (
                <List
                    items={[
                        'Memublikasikan beasiswa atau lowongan palsu, atau memungut biaya yang tidak sah dari peserta.',
                        'Menyamar sebagai orang atau organisasi lain.',
                        'Mencoba mengakses data, akun, atau dokumen milik pengguna lain.',
                        'Mengunggah berkas berbahaya, spam, atau konten yang melanggar hukum.',
                        'Mengambil data platform secara otomatis (scraping) tanpa izin tertulis.',
                    ]}
                />
            ),
        },
        {
            id: 'hak-cipta',
            title: 'Hak atas konten',
            body: (
                <p>
                    Konten yang Anda unggah, seperti dokumen, esai, dan deskripsi program, tetap menjadi milik Anda. Anda memberi kami izin terbatas untuk menyimpan dan menampilkannya sebatas yang diperlukan agar fitur berjalan, sesuai pengaturan berbagi yang Anda pilih.
                </p>
            ),
        },
        {
            id: 'penangguhan',
            title: 'Penangguhan dan pengakhiran',
            body: (
                <p>
                    Kami dapat menangguhkan atau menutup akun yang melanggar ketentuan ini, terutama dalam kasus penipuan atau penyalahgunaan data. Anda dapat berhenti menggunakan platform kapan saja dan meminta penghapusan akun melalui {mail}.
                </p>
            ),
        },
        {
            id: 'tanggung-jawab',
            title: 'Batasan tanggung jawab',
            body: (
                <p>
                    Platform disediakan sebagaimana adanya. Kami berupaya menjaga informasi tetap akurat dan layanan tetap tersedia, tetapi tidak bertanggung jawab atas keputusan penyelenggara program, perubahan informasi di kanal resmi, atau kerugian akibat penggunaan informasi tanpa verifikasi ke sumber resminya.
                </p>
            ),
        },
        {
            id: 'perubahan',
            title: 'Perubahan ketentuan',
            body: <p>Ketentuan ini dapat diperbarui. Perubahan penting akan diberitahukan melalui platform, dan penggunaan berkelanjutan setelah pembaruan berarti Anda menyetujui ketentuan yang baru.</p>,
        },
        {
            id: 'hukum',
            title: 'Hukum yang berlaku',
            body: <p>Ketentuan ini diatur oleh hukum Republik Indonesia.</p>,
        },
        {
            id: 'kontak',
            title: 'Hubungi kami',
            body: <p>Pertanyaan mengenai ketentuan ini dapat dikirim ke {mail}.</p>,
        },
    ];

    return (
        <LegalLayout
            title="Syarat Penggunaan"
            intro={<p>Ketentuan ini mengatur penggunaan {platformName} oleh peserta, mentor, mitra pendidikan, dan perusahaan. Mohon dibaca sebelum menggunakan layanan.</p>}
            sections={sections}
        />
    );
}
