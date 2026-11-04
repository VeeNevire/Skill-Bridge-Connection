import { Head, router } from '@inertiajs/react';
import { CheckCircle2, EyeOff, Flag, ShieldAlert, UserRound } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Badge, EmptyState, Modal, PageHeader, Pagination, Segmented, severityTone, timeAgo, typeTone, useFilters } from '@/components/admin/ui';
import { Panel } from '@/components/dashboard/panel';
import admin from '@/routes/admin';
import type { Option, Paginated, ReportRow } from '@/types';

type Filters = { status: string; severity?: string };
type Props = { reports: Paginated<ReportRow>; filters: Filters; statuses: Option[]; severities: Option[] };

const only = ['reports', 'filters'];
const typeLabels: Record<string, string> = { beasiswa: 'Beasiswa', kelas: 'Kelas', lowongan: 'Lowongan' };
const severityLabels: Record<string, string> = { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' };

function HandleDialog({ report, open, onClose }: { report: ReportRow; open: boolean; onClose: () => void }) {
    const [takeDown, setTakeDown] = useState(report.severity === 'tinggi');
    const [note, setNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const send = (status: 'ditindak' | 'diabaikan') =>
        router.patch(
            admin.reports.update.url(report.id),
            { status, take_down: status === 'ditindak' && takeDown, note },
            { preserveScroll: true, onStart: () => setProcessing(true), onFinish: () => setProcessing(false), onSuccess: onClose },
        );

    return (
        <Modal open={open} onClose={onClose} title="Tangani laporan">
            <p className="text-[13px] font-medium">{report.opportunity.title}</p>
            <p className="mt-0.5 text-[12px] text-black/50">
                {report.reason}
                {report.details ? ` — ${report.details}` : ''}
            </p>

            <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-black/10 p-3">
                <input type="checkbox" checked={takeDown} onChange={(e) => setTakeDown(e.target.checked)} className="mt-0.5 size-4 accent-cta" />
                <span className="text-[12.5px]">
                    <span className="font-medium">Turunkan konten</span>
                    <span className="block text-black/50">Konten ditolak dan tidak lagi tampil di katalog publik.</span>
                </span>
            </label>

            <label className="mt-3 block text-[12.5px] font-medium text-black/70">
                Catatan (opsional)
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={255}
                    className="mt-1.5 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-[13px] font-normal outline-none focus:border-brand"
                />
            </label>

            <div className="mt-4 flex justify-end gap-2">
                <button
                    type="button"
                    disabled={processing}
                    onClick={() => send('diabaikan')}
                    className="rounded-lg px-3.5 py-2 text-[13px] text-black/60 hover:bg-zinc-100"
                >
                    Abaikan laporan
                </button>
                <button
                    type="button"
                    disabled={processing}
                    onClick={() => send('ditindak')}
                    className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-white disabled:opacity-60"
                >
                    Tindak lanjuti
                </button>
            </div>
        </Modal>
    );
}

function ReportItem({ report, open }: { report: ReportRow; open: boolean }) {
    const [handling, setHandling] = useState(false);

    return (
        <motion.li
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3 rounded-xl p-3 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center"
        >
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${report.severity === 'tinggi' ? 'bg-cta/10 text-cta' : 'bg-amber-500/10 text-amber-600'}`}>
                <ShieldAlert className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{report.opportunity.title}</p>
                    {report.opportunity.type && <Badge tone={typeTone[report.opportunity.type]}>{typeLabels[report.opportunity.type]}</Badge>}
                    <Badge tone={severityTone[report.severity]}>Prioritas {severityLabels[report.severity].toLowerCase()}</Badge>
                    {report.opportunity.status === 'ditolak' && (
                        <span className="flex items-center gap-1 text-[11px] text-black/45">
                            <EyeOff className="size-3.5" /> Sudah diturunkan
                        </span>
                    )}
                </div>
                <p className="mt-1 text-[12.5px] text-black/60">
                    <span className="font-medium text-ink">{report.reason}</span>
                    {report.details ? ` — ${report.details}` : ''}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11.5px] text-black/40">
                    <UserRound className="size-3.5" />
                    {report.reporter?.name ?? 'Anonim'} · {timeAgo(report.created_at)}
                    {report.resolution_note && <span className="ml-2 text-black/55">Catatan: {report.resolution_note}</span>}
                </p>
            </div>
            {open && (
                <>
                    <button
                        type="button"
                        onClick={() => setHandling(true)}
                        className="h-9 shrink-0 rounded-lg bg-ink px-4 text-[12.5px] font-medium text-white transition-colors hover:bg-black"
                    >
                        Tangani
                    </button>
                    <HandleDialog report={report} open={handling} onClose={() => setHandling(false)} />
                </>
            )}
        </motion.li>
    );
}

export default function ReportsIndex({ reports, filters, statuses, severities }: Props) {
    const apply = useFilters(admin.reports.index.url(), filters, only);

    return (
        <>
            <Head title="Laporan" />
            <PageHeader title="Laporan Pengguna" subtitle="Konten yang dilaporkan karena penipuan, kedaluwarsa, atau tidak pantas." />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Segmented id="report-status" value={filters.status} onChange={(status) => apply({ status })} options={statuses} />
                <Segmented
                    id="report-severity"
                    value={filters.severity ?? ''}
                    onChange={(severity) => apply({ severity })}
                    options={[{ value: '', label: 'Semua prioritas' }, ...severities]}
                />
            </div>

            <Panel className="p-2 sm:p-3">
                {reports.data.length === 0 ? (
                    <EmptyState
                        icon={filters.status === 'terbuka' ? CheckCircle2 : Flag}
                        title={filters.status === 'terbuka' ? 'Tidak ada laporan terbuka' : 'Tidak ada data'}
                        text={filters.status === 'terbuka' ? 'Semua laporan sudah ditangani.' : undefined}
                    />
                ) : (
                    <ul>
                        <AnimatePresence initial={false}>
                            {reports.data.map((report) => (
                                <ReportItem key={report.id} report={report} open={filters.status === 'terbuka'} />
                            ))}
                        </AnimatePresence>
                    </ul>
                )}
            </Panel>
            <Pagination paginator={reports} only={only} />
        </>
    );
}

ReportsIndex.layout = AdminLayout;
