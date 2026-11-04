import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { easeOut } from '@/components/landing/blur-text';
import { CalendarIcon, PlusIcon } from '@/components/landing/icons';
import { applications, stages } from '@/data/dashboard';
import type { OpportunityType, Stage } from '@/data/dashboard';
import { cn } from '@/lib/utils';
import { Panel, PanelHeader } from './panel';

const filters: ('Semua' | OpportunityType)[] = ['Semua', 'Beasiswa', 'Magang', 'Pekerjaan'];

export const stageStyles: Record<Stage, string> = {
    'Ingin daftar': 'bg-zinc-100 text-zinc-600',
    Persiapan: 'bg-amber-100 text-amber-700',
    Dikirim: 'bg-sky-100 text-sky-700',
    Seleksi: 'bg-violet-100 text-violet-700',
    Diterima: 'bg-emerald-100 text-emerald-700',
};

const stageDots: Record<Stage, string> = {
    'Ingin daftar': 'bg-zinc-400',
    Persiapan: 'bg-amber-500',
    Dikirim: 'bg-sky-500',
    Seleksi: 'bg-violet-500',
    Diterima: 'bg-emerald-500',
};

export function ApplicationTracker({ index }: { index: number }) {
    const [filter, setFilter] = useState<(typeof filters)[number]>('Semua');
    const visible = applications.filter((a) => filter === 'Semua' || a.type === filter);

    return (
        <Panel index={index} className="xl:col-span-2">
            <PanelHeader
                title="Application Tracker"
                subtitle="Catatan pribadi status pendaftaran Anda"
                action={
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-[12px] font-medium text-white"
                    >
                        <PlusIcon className="size-3.5" />
                        Tambah
                    </motion.button>
                }
            />

            <div className="-mx-5 mb-4 grid auto-cols-[minmax(92px,1fr)] grid-flow-col gap-1.5 overflow-x-auto px-5 [scrollbar-width:none]">
                {stages.map((stage) => {
                    const count = applications.filter((a) => a.stage === stage).length;

                    return (
                        <div key={stage} className="rounded-xl bg-zinc-50 px-2.5 py-2">
                            <div className="flex items-center gap-1.5">
                                <span className={cn('size-1.5 rounded-full', stageDots[stage])} />
                                <span className="truncate text-[10.5px] text-black/50">{stage}</span>
                            </div>
                            <div className="mt-0.5 text-lg font-semibold">{count}</div>
                        </div>
                    );
                })}
            </div>

            <div role="tablist" className="mb-3 flex gap-1 overflow-x-auto">
                {filters.map((f) => (
                    <button
                        key={f}
                        type="button"
                        role="tab"
                        aria-selected={filter === f}
                        onClick={() => setFilter(f)}
                        className={cn('relative rounded-lg px-3 py-1.5 text-[12px] whitespace-nowrap transition-colors', filter === f ? 'text-ink' : 'text-black/45 hover:text-ink')}
                    >
                        {filter === f && (
                            <motion.span
                                layoutId="tracker-filter"
                                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                className="absolute inset-0 rounded-lg bg-zinc-100"
                            />
                        )}
                        <span className="relative">{f}</span>
                    </button>
                ))}
            </div>

            <ul className="divide-y divide-black/5">
                <AnimatePresence mode="popLayout" initial={false}>
                    {visible.map((app) => {
                        const pct = Math.round((app.checklist.done / app.checklist.total) * 100);

                        return (
                            <motion.li
                                key={app.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3, ease: easeOut }}
                                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[1fr_110px_120px_auto]"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-medium">{app.name}</p>
                                    <p className="truncate text-[11.5px] text-black/45">
                                        {app.organizer} · {app.type}
                                    </p>
                                </div>
                                <div className="order-last col-span-2 sm:order-none sm:col-span-1">
                                    <div className="flex justify-between text-[10.5px] text-black/45">
                                        <span>Checklist</span>
                                        <span>
                                            {app.checklist.done}/{app.checklist.total}
                                        </span>
                                    </div>
                                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                                        <motion.div
                                            className={cn('h-full rounded-full', pct === 100 ? 'bg-emerald-500' : 'bg-brand')}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.9, delay: 0.3, ease: easeOut }}
                                        />
                                    </div>
                                </div>
                                <span className="hidden items-center gap-1.5 text-[11.5px] text-black/50 sm:flex">
                                    <CalendarIcon className="size-3.5" />
                                    {app.deadline}
                                </span>
                                <span className={cn('justify-self-end rounded-full px-2.5 py-1 text-[11px] font-medium', stageStyles[app.stage])}>{app.stage}</span>
                            </motion.li>
                        );
                    })}
                </AnimatePresence>
            </ul>
        </Panel>
    );
}
