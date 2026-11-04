import { Head, Link, usePage, router } from '@inertiajs/react';
import { DataForm } from '@/components/dashboard/data-form';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { navItems, accountNavItems } from '@/data/dashboard';
import { home, login, dashboard } from '@/routes';
import { apply, index, report } from '@/routes/catalog';
import { store } from '@/routes/applications';
import { enroll } from '@/routes/learning';

type Opportunity = {
    id: number;
    title: string;
    type: string;
    summary: string | null;
    details: Record<string, unknown> | null;
    deadline: string | null;
    source_url: string | null;
    reviewed_at: string | null;
    accepts_applications: boolean;
    organization: { name: string } | null;
};
export default function Show({
    opportunity: item,
}: {
    opportunity: Opportunity;
}) {
    const user = usePage().props.auth.user;
    const participant = user?.roles.some((role) => role.name === 'peserta');
    const content = (
        <div className="mx-auto max-w-3xl space-y-5">
            <Link href={index(item.type)} className="text-sm text-brand">
                Kembali ke katalog
            </Link>
            <article className="space-y-4 rounded-2xl bg-white p-6">
                <h1 className="text-2xl font-semibold">{item.title}</h1>
                <p className="text-sm text-black/50">
                    {item.organization?.name ??
                        'Penyelenggara belum dicantumkan'}
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-black/70">
                    {item.summary}
                </p>
                {Object.entries(item.details ?? {}).map(([key, value]) => (
                    <p key={key} className="text-sm">
                        <span className="font-medium">
                            {key.replaceAll('_', ' ')}:
                        </span>{' '}
                        {typeof value === 'string' || typeof value === 'number'
                            ? value
                            : Array.isArray(value)
                              ? value.join(', ')
                              : ''}
                    </p>
                ))}
                <p className="text-sm">
                    Tenggat:{' '}
                    {item.deadline
                        ? new Date(item.deadline).toLocaleDateString('id-ID')
                        : 'Belum dicantumkan'}
                </p>
                {item.reviewed_at && (
                    <p className="text-xs text-black/45">
                        Ditinjau:{' '}
                        {new Date(item.reviewed_at).toLocaleDateString('id-ID')}
                    </p>
                )}
                {item.source_url && /^https?:\/\//i.test(item.source_url) && (
                    <a
                        className="inline-block text-sm font-medium text-brand"
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Buka kanal resmi
                    </a>
                )}
                {participant && (
                    <div>
                        <Link
                            href={store(item.id)}
                            as="button"
                            className="rounded-xl bg-ink px-4 py-2 text-sm text-white"
                        >
                            Simpan ke Application Studio
                        </Link>
                    </div>
                )}
                {!user && (
                    <Link
                        className="inline-block text-sm text-brand"
                        href={login()}
                    >
                        Masuk untuk menyimpan peluang
                    </Link>
                )}
            </article>
            {participant && item.type === 'kelas' && (
                <div className="rounded-2xl bg-white p-5">
                    <Link
                        href={enroll(item.id)}
                        as="button"
                        className="rounded-xl bg-brand px-4 py-2 text-sm text-white"
                    >
                        Ikuti kelas
                    </Link>
                </div>
            )}
            {participant && item.accepts_applications && (
                <DataForm
                    title="Daftar langsung ke organisasi"
                    action={apply(item.id)}
                    button="Kirim pendaftaran"
                    fields={[
                        {
                            key: 'message',
                            label: 'Pesan dan ringkasan kualifikasi',
                            type: 'textarea',
                        },
                        {
                            key: 'portfolio_url',
                            label: 'Tautan portofolio (opsional)',
                            type: 'url',
                        },
                        {
                            key: 'consent',
                            label: 'Saya menyetujui pengiriman nama, email, pesan, dan tautan portofolio pada formulir ini kepada organisasi penyelenggara.',
                            type: 'checkbox',
                        },
                    ]}
                />
            )}
            {participant && (
                <details className="rounded-2xl bg-white p-5">
                    <summary className="cursor-pointer text-sm text-cta">
                        Laporkan informasi bermasalah
                    </summary>
                    <DataForm
                        action={report(item.id)}
                        button="Kirim laporan ke admin"
                        fields={[
                            { key: 'reason', label: 'Alasan laporan' },
                            {
                                key: 'details',
                                label: 'Rincian dan informasi pendukung',
                                type: 'textarea',
                            },
                        ]}
                    />
                </details>
            )}
        </div>
    );
    return (
        <>
            <Head title={item.title} />
            {participant ? (
                <DashboardLayout
                    nav={navItems}
                    accountNav={accountNavItems}
                    active={
                        item.type === 'beasiswa'
                            ? 'scholarship'
                            : item.type === 'kelas'
                              ? 'academy'
                              : 'career'
                    }
                    onSelect={(key) => {
                        if (
                            ![...navItems, ...accountNavItems].find(
                                (n) => n.key === key,
                            )?.href
                        )
                            router.get(dashboard.url({ query: { menu: key } }));
                    }}
                    searchPlaceholder="Cari peluang"
                >
                    {content}
                </DashboardLayout>
            ) : (
                <div className="min-h-screen bg-surface p-6">
                    <Link href={home()} className="mb-8 block text-brand">
                        SkillBridge Connect
                    </Link>
                    {content}
                </div>
            )}
        </>
    );
}
