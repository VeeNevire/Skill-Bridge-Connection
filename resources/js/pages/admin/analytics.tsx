import { Head } from '@inertiajs/react';
import { BadgeCheck, Building2, Flag, UserPlus, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { PageHeader } from '@/components/admin/ui';
import { Panel, PanelHeader } from '@/components/dashboard/panel';
import { CountUp } from '@/components/dashboard/widgets';
import { easeOut } from '@/components/landing/blur-text';
import type { UserStats } from '@/types';

type Props = {
    userStats: UserStats;
    signups: { date: string; count: number }[];
    opportunities: Record<string, Record<string, number>>;
    reportsByStatus: Record<string, number>;
    verifiedPartners: number;
    verifiedMentors: number;
    topCategories: { id: number; name: string; opportunities_count: number }[];
    openReports: number;
};

const typeMeta: Record<string, { label: string; color: string }> = {
    beasiswa: { label: 'Beasiswa', color: '#8b5cf6' },
    kelas: { label: 'Kelas', color: '#0ea5e9' },
    lowongan: { label: 'Lowongan', color: '#10b981' },
};
const statusMeta: Record<string, { label: string; color: string }> = {
    disetujui: { label: 'Disetujui', color: '#10b981' },
    menunggu: { label: 'Menunggu', color: '#f59e0b' },
    ditolak: { label: 'Ditolak', color: '#f04438' },
};
const reportMeta: Record<string, string> = { terbuka: 'Terbuka', ditindak: 'Ditindak', diabaikan: 'Diabaikan' };

function Stat({ label, value, icon: Icon, tone, index }: { label: string; value: number; icon: LucideIcon; tone: string; index: number }) {
    return (
        <Panel index={index} className="p-4">
            <div className="flex items-center justify-between">
                <span className="text-[12px] text-black/50">{label}</span>
                <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
                    <Icon className="size-4" />
                </span>
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">
                <CountUp to={value} />
            </div>
        </Panel>
    );
}

function SignupTrend({ signups }: { signups: Props['signups'] }) {
    const max = Math.max(1, ...signups.map((s) => s.count));
    const width = 600;
    const height = 160;
    const step = width / Math.max(1, signups.length - 1);
    const points = signups.map((s, i) => [i * step, height - (s.count / max) * (height - 10) - 5] as const);
    const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const total = signups.reduce((sum, s) => sum + s.count, 0);
    const day = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });

    return (
        <Panel index={4} className="xl:col-span-2">
            <PanelHeader title="Pendaftaran pengguna" subtitle={`30 hari terakhir · ${total} pendaftar`} />
            <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="signup-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path d={`${line} L${width} ${height} L0 ${height}Z`} fill="url(#signup-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
                <motion.path
                    d={line}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, ease: easeOut }}
                />
            </svg>
            <div className="mt-2 flex justify-between text-[10.5px] text-black/40">
                <span>{signups[0] && day.format(new Date(signups[0].date))}</span>
                <span>{signups.at(-1) && day.format(new Date(signups.at(-1)!.date))}</span>
            </div>
        </Panel>
    );
}

function StackedBar({ segments }: { segments: { value: number; color: string; label: string }[] }) {
    const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

    return (
        <div className="flex h-2.5 overflow-hidden rounded-full bg-zinc-100">
            {segments.map((s, i) => (
                <motion.div
                    key={s.label}
                    title={`${s.label}: ${s.value}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.value / total) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.1, ease: easeOut }}
                    style={{ backgroundColor: s.color }}
                />
            ))}
        </div>
    );
}

function ContentBreakdown({ opportunities }: { opportunities: Props['opportunities'] }) {
    return (
        <Panel index={5}>
            <PanelHeader title="Konten per tipe" subtitle="Berdasarkan status moderasi" />
            <ul className="space-y-4">
                {Object.entries(typeMeta).map(([type, meta]) => {
                    const counts = opportunities[type] ?? {};
                    const total = Object.values(counts).reduce((a, b) => a + b, 0);

                    return (
                        <li key={type}>
                            <div className="mb-1.5 flex justify-between text-[12.5px]">
                                <span className="font-medium">{meta.label}</span>
                                <span className="text-black/45">{total}</span>
                            </div>
                            <StackedBar segments={Object.entries(statusMeta).map(([status, s]) => ({ value: counts[status] ?? 0, color: s.color, label: s.label }))} />
                        </li>
                    );
                })}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-black/50">
                {Object.values(statusMeta).map((s) => (
                    <span key={s.label} className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.label}
                    </span>
                ))}
            </div>
        </Panel>
    );
}

function TopCategories({ categories }: { categories: Props['topCategories'] }) {
    const max = Math.max(1, ...categories.map((c) => c.opportunities_count));

    return (
        <Panel index={6} className="xl:col-span-2">
            <PanelHeader title="Kategori teratas" subtitle="Jumlah konten per kategori" />
            <ul className="space-y-3">
                {categories.map((c, i) => (
                    <li key={c.id} className="flex items-center gap-3">
                        <span className="w-40 shrink-0 truncate text-[12.5px]">{c.name}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                            <motion.div
                                className="h-full rounded-full bg-brand"
                                initial={{ width: 0 }}
                                animate={{ width: `${(c.opportunities_count / max) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: easeOut }}
                            />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[12px] text-black/50">{c.opportunities_count}</span>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

function ReportsSummary({ reports }: { reports: Props['reportsByStatus'] }) {
    return (
        <Panel index={7}>
            <PanelHeader title="Laporan" subtitle="Berdasarkan status" />
            <ul className="space-y-2.5">
                {Object.entries(reportMeta).map(([status, label]) => (
                    <li key={status} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 text-[13px]">
                        <span>{label}</span>
                        <span className="font-semibold">{reports[status] ?? 0}</span>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

export default function Analytics(props: Props) {
    return (
        <>
            <Head title="Analitik" />
            <PageHeader title="Analitik" subtitle="Gambaran pertumbuhan pengguna, konten, dan kepercayaan platform." />

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <Stat index={0} label="Total pengguna" value={props.userStats.total} icon={Users} tone="bg-brand/10 text-brand" />
                <Stat index={1} label="Baru minggu ini" value={props.userStats.newThisWeek} icon={UserPlus} tone="bg-sky-500/10 text-sky-600" />
                <Stat index={2} label="Mitra terverifikasi" value={props.verifiedPartners} icon={Building2} tone="bg-emerald-500/10 text-emerald-600" />
                <Stat index={3} label="Mentor terverifikasi" value={props.verifiedMentors} icon={BadgeCheck} tone="bg-amber-500/10 text-amber-600" />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <SignupTrend signups={props.signups} />
                <ContentBreakdown opportunities={props.opportunities} />
                <TopCategories categories={props.topCategories} />
                <ReportsSummary reports={props.reportsByStatus} />
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-[11.5px] text-black/40">
                <Flag className="size-3.5" />
                Angka diperbarui otomatis; ringkasan di-cache singkat agar halaman tetap cepat.
            </p>
        </>
    );
}

Analytics.layout = AdminLayout;
