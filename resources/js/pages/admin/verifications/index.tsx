import { Head, router } from '@inertiajs/react';
import { BadgeCheck, Building2, Check, ExternalLink, Mail, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Badge, EmptyState, PageHeader, Pagination, ReasonDialog, Segmented, reviewTone, timeAgo, useFilters } from '@/components/admin/ui';
import { Panel } from '@/components/dashboard/panel';
import admin from '@/routes/admin';
import type { MentorRow, Option, OrganizationRow, Paginated, ReviewStatus } from '@/types';

type Tab = 'mitra' | 'mentor';
type Props = {
    tab: Tab;
    status: ReviewStatus;
    items: Paginated<OrganizationRow | MentorRow>;
    counts: Record<Tab, number>;
    statuses: Option[];
};

const only = ['items', 'tab', 'status', 'counts'];
const orgTypeLabels: Record<string, string> = { institusi: 'Institusi pendidikan', perusahaan: 'Perusahaan', yayasan: 'Yayasan / lembaga' };
const statusLabels: Record<string, string> = { menunggu: 'Menunggu', disetujui: 'Disetujui', ditolak: 'Ditolak' };

function Decision({ url, name }: { url: string; name: string }) {
    const [rejecting, setRejecting] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string>();

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
        <div className="flex shrink-0 gap-1.5">
            <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                disabled={processing}
                onClick={() => setRejecting(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-[12.5px] text-black/60 transition-colors hover:border-cta/40 hover:text-cta"
            >
                <X className="size-4" /> Tolak
            </motion.button>
            <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                disabled={processing}
                onClick={() => send('disetujui')}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
            >
                <Check className="size-4" /> Verifikasi
            </motion.button>
            <ReasonDialog
                open={rejecting}
                onClose={() => setRejecting(false)}
                title={`Tolak verifikasi ${name}`}
                confirmLabel="Tolak verifikasi"
                processing={processing}
                error={error}
                onConfirm={(note) => send('ditolak', note)}
            />
        </div>
    );
}

function OrganizationCard({ item }: { item: OrganizationRow }) {
    return (
        <>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <Building2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    <Badge tone="sky">{orgTypeLabels[item.type]}</Badge>
                </div>
                {item.description && <p className="mt-1 line-clamp-2 text-[12.5px] text-black/55">{item.description}</p>}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-black/45">
                    <span className="flex items-center gap-1">
                        <Mail className="size-3.5" />
                        {item.email}
                    </span>
                    {item.website && (
                        <a href={item.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand">
                            <ExternalLink className="size-3.5" />
                            {item.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                    <span>Diajukan {timeAgo(item.created_at)}</span>
                </div>
            </div>
        </>
    );
}

function MentorCard({ item }: { item: MentorRow }) {
    return (
        <>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-[13px] font-semibold text-brand">
                {item.user.name
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')}
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.user.name}</p>
                    <Badge tone="brand">{item.expertise}</Badge>
                    <span className="text-[11.5px] text-black/45">{item.years_experience} tahun pengalaman</span>
                </div>
                {item.bio && <p className="mt-1 line-clamp-2 text-[12.5px] text-black/55">{item.bio}</p>}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-black/45">
                    <span className="flex items-center gap-1">
                        <Mail className="size-3.5" />
                        {item.user.email}
                    </span>
                    <span>Diajukan {timeAgo(item.created_at)}</span>
                </div>
            </div>
        </>
    );
}

export default function VerificationsIndex({ tab, status, items, counts, statuses }: Props) {
    const apply = useFilters(admin.verifications.index.url(), { tab, status }, only);

    return (
        <>
            <Head title="Verifikasi" />
            <PageHeader title="Verifikasi" subtitle="Tinjau mitra dan mentor sebelum mereka bisa mempublikasikan atau membimbing." />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Segmented
                    id="verify-tab"
                    value={tab}
                    onChange={(value) => apply({ tab: value as Tab })}
                    counts={counts}
                    options={[
                        { value: 'mitra', label: 'Mitra' },
                        { value: 'mentor', label: 'Mentor' },
                    ]}
                />
                <Segmented id="verify-status" value={status} onChange={(value) => apply({ status: value as ReviewStatus })} options={statuses} />
            </div>

            <Panel className="p-2 sm:p-3">
                {items.data.length === 0 ? (
                    <EmptyState icon={BadgeCheck} title="Tidak ada data" text={`Belum ada ${tab} dengan status ${statusLabels[status].toLowerCase()}.`} />
                ) : (
                    <ul>
                        <AnimatePresence initial={false}>
                            {items.data.map((item) => (
                                <motion.li
                                    key={`${tab}-${item.id}`}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-col gap-3 rounded-xl p-3 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center"
                                >
                                    <div className="flex min-w-0 flex-1 gap-3">
                                        {tab === 'mitra' ? <OrganizationCard item={item as OrganizationRow} /> : <MentorCard item={item as MentorRow} />}
                                    </div>
                                    {status === 'menunggu' ? (
                                        <Decision
                                            url={
                                                tab === 'mitra'
                                                    ? admin.verifications.organizations.update.url(item.id)
                                                    : admin.verifications.mentors.update.url(item.id)
                                            }
                                            name={'name' in item ? item.name : item.user.name}
                                        />
                                    ) : (
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <Badge tone={reviewTone[status]}>{statusLabels[status]}</Badge>
                                            {item.review_note && <p className="max-w-[220px] text-right text-[11px] text-black/45">{item.review_note}</p>}
                                        </div>
                                    )}
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                )}
            </Panel>
            <Pagination paginator={items} only={only} />
        </>
    );
}

VerificationsIndex.layout = AdminLayout;
