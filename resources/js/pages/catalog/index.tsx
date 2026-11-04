import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pagination, SearchInput, useFilters } from '@/components/admin/ui';
import { dashboard, home, login } from '@/routes';
import { store as saveOpportunity } from '@/routes/applications';
import { index, show } from '@/routes/catalog';
import type { Paginated } from '@/types';
import {
    DashboardLayout,
    ProfileSidebarCard,
} from '@/components/dashboard/dashboard-layout';
import { accountNavItems, navItems } from '@/data/dashboard';

type Opportunity = {
    id: number;
    title: string;
    summary: string | null;
    deadline: string | null;
    source_url: string | null;
    details: Record<string, unknown> | null;
    organization: { name: string } | null;
    category: { name: string } | null;
};
type Filters = {
    organizer?: string;
    deadline_before?: string;
    work_type?: string;
    q?: string;
    category?: string;
    level?: string;
    location?: string;
};
const labels: Record<string, string> = {
    beasiswa: 'Beasiswa',
    kelas: 'Belajar',
    lowongan: 'Karier',
};

export default function Catalog({
    opportunities,
    filters,
    type,
    categories,
}: {
    opportunities: Paginated<Opportunity>;
    filters: Filters;
    type: string;
    categories: { id: number; name: string }[];
}) {
    const apply = useFilters(index.url(type), filters, [
        'opportunities',
        'filters',
    ]);
    const title = labels[type];
    const user = usePage().props.auth.user;
    const participant = user?.roles.some((role) => role.name === 'peserta');
    const content = (
        <section className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-black/55">
                Jelajahi peluang yang telah ditinjau. Periksa informasi dan
                pendaftaran melalui sumber resmi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
                <SearchInput
                    value={filters.q ?? ''}
                    onSearch={(q) => apply({ q })}
                    placeholder="Cari berdasarkan judul"
                />
                <select
                    aria-label="Kategori"
                    value={filters.category ?? ''}
                    onChange={(e) => apply({ category: e.target.value })}
                    className="rounded-xl border border-black/5 bg-white px-3 text-sm"
                >
                    <option value="">Semua kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {type === 'beasiswa' && (
                    <>
                        <select
                            aria-label="Jenjang"
                            value={filters.level ?? ''}
                            onChange={(e) => apply({ level: e.target.value })}
                            className="rounded-xl border border-black/5 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">Semua jenjang</option>
                            {['S1', 'S2', 'S3'].map((v) => (
                                <option key={v}>{v}</option>
                            ))}
                        </select>
                        <select
                            aria-label="Lokasi"
                            value={filters.location ?? ''}
                            onChange={(e) =>
                                apply({ location: e.target.value })
                            }
                            className="rounded-xl border border-black/5 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">Semua lokasi</option>
                            {['Dalam negeri', 'Luar negeri'].map((v) => (
                                <option key={v}>{v}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
                <SearchInput
                    value={filters.organizer ?? ''}
                    onSearch={(organizer) => apply({ organizer })}
                    placeholder="Cari penyelenggara"
                />
                <label className="text-xs text-black/50">
                    Tenggat sampai
                    <input
                        type="date"
                        aria-label="Tenggat sampai"
                        className="ml-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm text-ink"
                        value={filters.deadline_before ?? ''}
                        onChange={(event) =>
                            apply({ deadline_before: event.target.value })
                        }
                    />
                </label>
                {type === 'lowongan' && (
                    <>
                        <input
                            aria-label="Lokasi pekerjaan"
                            className="rounded-xl border border-black/5 bg-white px-3 py-2 text-sm"
                            placeholder="Lokasi pekerjaan"
                            defaultValue={filters.location ?? ''}
                            onBlur={(event) =>
                                apply({ location: event.target.value })
                            }
                        />
                        <select
                            aria-label="Tipe pekerjaan"
                            className="rounded-xl border border-black/5 bg-white px-3 py-2 text-sm"
                            value={filters.work_type ?? ''}
                            onChange={(event) =>
                                apply({ work_type: event.target.value })
                            }
                        >
                            <option value="">Semua tipe pekerjaan</option>
                            {['Magang', 'Penuh waktu', 'Paruh waktu'].map(
                                (value) => (
                                    <option key={value}>{value}</option>
                                ),
                            )}
                        </select>
                    </>
                )}
                {type === 'kelas' && (
                    <select
                        aria-label="Tingkat kelas"
                        className="rounded-xl border border-black/5 bg-white px-3 py-2 text-sm"
                        value={filters.level ?? ''}
                        onChange={(event) =>
                            apply({ level: event.target.value })
                        }
                    >
                        <option value="">Semua tingkat</option>
                        {['Pemula', 'Menengah', 'Mahir'].map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                )}
            </div>
            {opportunities.data.length === 0 ? (
                <p className="mt-8 rounded-2xl bg-white p-8 text-center text-sm text-black/50">
                    Belum ada peluang yang sesuai.
                </p>
            ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {opportunities.data.map((item) => (
                        <article
                            key={item.id}
                            className="flex flex-col rounded-2xl border border-black/5 bg-white p-5"
                        >
                            <span className="text-xs font-medium text-brand">
                                {item.category?.name ?? title}
                            </span>
                            <h2 className="mt-2 text-lg font-semibold">
                                <Link
                                    href={show(item.id)}
                                    className="hover:text-brand"
                                >
                                    {item.title}
                                </Link>
                            </h2>
                            <p className="mt-1 text-xs text-black/50">
                                {item.organization?.name ??
                                    'Penyelenggara belum dicantumkan'}
                            </p>
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-black/60">
                                {item.summary}
                            </p>
                            <p className="mt-4 text-xs text-black/50">
                                {item.deadline
                                    ? `Tenggat: ${new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                    : 'Tenggat belum dicantumkan'}
                            </p>
                            {participant ? (
                                <Link
                                    href={saveOpportunity(item.id)}
                                    as="button"
                                    className="mt-4 self-start rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white"
                                >
                                    Simpan peluang
                                </Link>
                            ) : !user ? (
                                <Link
                                    href={login()}
                                    className="mt-4 self-start text-sm font-medium text-brand"
                                >
                                    Masuk untuk menyimpan
                                </Link>
                            ) : null}
                            {item.source_url &&
                                /^https?:\/\//i.test(item.source_url) && (
                                    <a
                                        href={item.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 text-sm font-medium text-brand hover:underline"
                                    >
                                        Buka sumber resmi
                                    </a>
                                )}
                        </article>
                    ))}
                </div>
            )}
            <Pagination
                paginator={opportunities}
                only={['opportunities', 'filters']}
            />
        </section>
    );

    if (participant) {
        const active =
            { beasiswa: 'scholarship', kelas: 'academy', lowongan: 'career' }[
                type
            ] ?? 'scholarship';
        return (
            <DashboardLayout
                nav={navItems}
                accountNav={accountNavItems}
                active={active}
                onSelect={(key) => {
                    if (
                        ![...navItems, ...accountNavItems].find(
                            (item) => item.key === key,
                        )?.href
                    ) {
                        router.get(dashboard.url({ query: { menu: key } }));
                    }
                }}
                footer={<ProfileSidebarCard />}
                searchPlaceholder="Cari beasiswa, kelas, mentor…"
            >
                <Head title={title} />
                {content}
            </DashboardLayout>
        );
    }

    return (
        <div className="min-h-screen bg-surface px-4 py-6 font-sans text-ink sm:px-8">
            <Head title={title} />
            <header className="mx-auto flex max-w-6xl items-center justify-between">
                <Link href={home()} className="text-lg font-bold text-brand">
                    SkillBridge Connect
                </Link>
                <Link
                    href={user ? dashboard() : home()}
                    className="text-sm text-black/60 hover:text-ink"
                >
                    {user ? 'Dashboard' : 'Beranda'}
                </Link>
            </header>
            <main className="mt-12">{content}</main>
        </div>
    );
}
