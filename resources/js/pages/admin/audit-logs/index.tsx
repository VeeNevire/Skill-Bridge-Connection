import { Head } from '@inertiajs/react';
import { BadgeCheck, Flag, Settings, ShieldCheck, ScrollText, Tags, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { CursorPagination, EmptyState, PageHeader, Segmented, useFilters } from '@/components/admin/ui';
import { Panel } from '@/components/dashboard/panel';
import admin from '@/routes/admin';
import type { AuditLogRow, CursorPaginated, Option } from '@/types';

type Props = { logs: CursorPaginated<AuditLogRow>; filters: { action?: string }; actions: Option[] };

const only = ['logs', 'filters'];

const groups: Record<string, { icon: LucideIcon; tone: string }> = {
    opportunity: { icon: ShieldCheck, tone: 'bg-amber-500/10 text-amber-600' },
    organization: { icon: BadgeCheck, tone: 'bg-sky-500/10 text-sky-600' },
    mentor: { icon: BadgeCheck, tone: 'bg-brand/10 text-brand' },
    report: { icon: Flag, tone: 'bg-cta/10 text-cta' },
    user: { icon: Users, tone: 'bg-emerald-500/10 text-emerald-600' },
    category: { icon: Tags, tone: 'bg-zinc-100 text-zinc-600' },
    settings: { icon: Settings, tone: 'bg-zinc-100 text-zinc-600' },
};

const timestamp = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AuditLogsIndex({ logs, filters, actions }: Props) {
    const apply = useFilters(admin.auditLogs.index.url(), filters, only);

    return (
        <>
            <Head title="Audit Log" />
            <PageHeader title="Audit Log" subtitle="Catatan setiap tindakan penting admin, terbaru di atas." />

            <div className="mb-4">
                <Segmented id="audit-action" value={filters.action ?? ''} onChange={(action) => apply({ action })} options={[{ value: '', label: 'Semua' }, ...actions]} />
            </div>

            <Panel className="p-2 sm:p-3">
                {logs.data.length === 0 ? (
                    <EmptyState icon={ScrollText} title="Belum ada aktivitas" />
                ) : (
                    <ul className="divide-y divide-black/5">
                        {logs.data.map((log, i) => {
                            const group = groups[log.action.split('.')[0]] ?? groups.settings;

                            return (
                                <motion.li
                                    key={log.id}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(i, 10) * 0.02 }}
                                    className="flex items-center gap-3 px-2 py-3"
                                >
                                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${group.tone}`}>
                                        <group.icon className="size-4" />
                                    </span>
                                    <p className="min-w-0 flex-1 text-[13px] leading-snug">
                                        <span className="font-medium">{log.user?.name ?? 'Sistem'}</span> <span className="text-black/60">{log.description}</span>
                                    </p>
                                    <span className="shrink-0 text-right text-[11.5px] text-black/40">{timestamp.format(new Date(log.created_at))}</span>
                                </motion.li>
                            );
                        })}
                    </ul>
                )}
            </Panel>
            <CursorPagination paginator={logs} only={only} />
        </>
    );
}

AuditLogsIndex.layout = AdminLayout;
