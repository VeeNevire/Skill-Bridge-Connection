import { Head, router } from '@inertiajs/react';
import { Building2, CalendarDays, Check, ExternalLink, Flag, ShieldCheck, Tag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Badge, EmptyState, formatDate, PageHeader, Pagination, ReasonDialog, SearchInput, Segmented, reviewTone, timeAgo, typeTone, useFilters } from '@/components/admin/ui';
import { Panel } from '@/components/dashboard/panel';
import admin from '@/routes/admin';
import type { OpportunityRow, Option, Paginated } from '@/types';

type Filters = { status: string; type?: string; q?: string };
type Props = { opportunities: Paginated<OpportunityRow>; filters: Filters; statuses: Option[]; types: Option[] };

const only = ['opportunities', 'filters'];
const typeLabels: Record<string, string> = { beasiswa: 'Beasiswa', kelas: 'Kelas', lowongan: 'Lowongan' };
const statusLabels: Record<string, string> = { menunggu: 'Menunggu', disetujui: 'Disetujui', ditolak: 'Ditolak' };

function humanize(key: string) {
    return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function ReviewActions({ item }: { item: OpportunityRow }) {
    const [rejecting, setRejecting] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string>();
    const url = admin.moderation.update.url(item.id);

    const send = (decision: string, note?: string) =>
        router.patch(
            url,
            { decision, note },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => setRejecting(false),
                onError: (errors) => setError(errors.note),
            },
        );

    return (
        <div className="flex gap-1.5">
            {item.status !== 'ditolak' && (
                <button
                    type="button"
                    disabled={processing}
                    onClick={() => setRejecting(true)}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-black/10 px-3 text-[12.5px] text-black/60 transition-colors hover:border-cta/40 hover:text-cta"
                >
                    <X className="size-4" /> {item.status === 'disetujui' ? 'Turunkan' : 'Tolak'}
                </button>
            )}
            {item.status !== 'disetujui' && (
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    disabled={processing}
                    onClick={() => send('disetujui')}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
                >
                    <Check className="size-4" /> Setujui
                </motion.button>
            )}
            <ReasonDialog
                open={rejecting}
                onClose={() => setRejecting(false)}
                title={`Tolak "${item.title}"`}
                confirmLabel="Tolak konten"
                processing={processing}
                error={error}
                onConfirm={(note) => send('ditolak', note)}
            />
        </div>
    );
}

function OpportunityCard({ item }: { item: OpportunityRow }) {
    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col rounded-2xl border border-black/5 bg-white p-4"
        >
            <div className="flex items-center gap-2">
                <Badge tone={typeTone[item.type]}>{typeLabels[item.type]}</Badge>
                {item.status !== 'menunggu' && <Badge tone={reviewTone[item.status ?? 'menunggu']}>{statusLabels[item.status ?? 'menunggu']}</Badge>}
                {(item.open_reports_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-cta">
                        <Flag className="size-3.5" />
                        {item.open_reports_count} laporan
                    </span>
                )}
                <span className="ml-auto text-[11px] text-black/40">{timeAgo(item.created_at)}</span>
            </div>
            <h3 className="mt-3 text-[14.5px] leading-snug font-semibold">{item.title}</h3>
            {item.summary && <p className="mt-1 line-clamp-2 text-[12.5px] text-black/55">{item.summary}</p>}

            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-black/60">
                {item.organization && (
                    <span className="flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5">
                        <Building2 className="size-3" />
                        {item.organization.name}
                    </span>
                )}
                {item.category && (
                    <span className="flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5">
                        <Tag className="size-3" />
                        {item.category.name}
                    </span>
                )}
                {item.deadline && (
                    <span className="flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5">
                        <CalendarDays className="size-3" />
                        {formatDate(item.deadline)}
                    </span>
                )}
                {Object.entries(item.details ?? {}).map(([key, value]) => (
                    <span key={key} className="rounded-md bg-zinc-100 px-1.5 py-0.5">
                        {humanize(key)}: {String(value)}
                    </span>
                ))}
            </div>

            {item.review_note && <p className="mt-3 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11.5px] text-red-700">Catatan: {item.review_note}</p>}

            <div className="mt-auto flex items-center gap-2 pt-4">
                {item.source_url && (
                    <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Buka sumber"
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-black/10 text-black/50 hover:text-ink"
                    >
                        <ExternalLink className="size-4" />
                    </a>
                )}
                <div className="flex-1">
                    <ReviewActions item={item} />
                </div>
            </div>
        </motion.article>
    );
}

export default function ModerationIndex({ opportunities, filters, statuses, types }: Props) {
    const apply = useFilters(admin.moderation.index.url(), filters, only);

    return (
        <>
            <Head title="Moderasi Konten" />
            <PageHeader title="Moderasi Konten" subtitle="Tinjau beasiswa, kelas, dan lowongan sebelum tampil di katalog publik." />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <SearchInput value={filters.q ?? ''} onSearch={(q) => apply({ q })} placeholder="Cari judul konten…" />
                <Segmented id="mod-status" value={filters.status} onChange={(status) => apply({ status })} options={statuses} />
                <Segmented id="mod-type" value={filters.type ?? ''} onChange={(type) => apply({ type })} options={[{ value: '', label: 'Semua tipe' }, ...types]} />
            </div>

            {opportunities.data.length === 0 ? (
                <Panel>
                    <EmptyState icon={ShieldCheck} title="Tidak ada konten" text="Tidak ada konten yang cocok dengan filter ini." />
                </Panel>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    <AnimatePresence initial={false} mode="popLayout">
                        {opportunities.data.map((item) => (
                            <OpportunityCard key={item.id} item={item} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
            <Pagination paginator={opportunities} only={only} />
        </>
    );
}

ModerationIndex.layout = AdminLayout;
