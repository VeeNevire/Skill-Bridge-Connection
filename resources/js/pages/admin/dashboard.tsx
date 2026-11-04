import { Head, Link, router, usePage } from '@inertiajs/react';
import { Activity, BadgeCheck, Building2, Check, Flag, ShieldCheck, UserPlus, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Badge, EmptyState, RoleBadges, severityTone, timeAgo, typeTone } from '@/components/admin/ui';
import { Chip, Greeting } from '@/components/dashboard/greeting';
import { Panel, PanelHeader } from '@/components/dashboard/panel';
import { CountUp } from '@/components/dashboard/widgets';
import { easeOut } from '@/components/landing/blur-text';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import type { AdminUser, AuditLogRow, MentorRow, OpportunityRow, OrganizationRow, ReportRow, UserStats } from '@/types';

type Props = {
    userStats: UserStats;
    signups: { date: string; count: number }[];
    pendingOpportunities: OpportunityRow[];
    pendingOrganizations: OrganizationRow[];
    pendingMentors: MentorRow[];
    openReports: ReportRow[];
    recentActivity: AuditLogRow[];
    latestUsers: AdminUser[];
};

const typeLabels: Record<string, string> = { beasiswa: 'Beasiswa', kelas: 'Kelas', lowongan: 'Lowongan' };
const severityLabels: Record<string, string> = { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' };

function SeeAll({ href }: { href: string }) {
    return (
        <Link href={href} prefetch className="shrink-0 text-[12px] font-medium text-brand hover:underline">
            Lihat semua
        </Link>
    );
}

function ApproveButton({ url, label }: { url: string; label: string }) {
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            aria-label={label}
            title={label}
            onClick={() => router.patch(url, { decision: 'disetujui' }, { preserveScroll: true })}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
        >
            <Check className="size-4" />
        </motion.button>
    );
}

function Kpis({ stats }: { stats: UserStats }) {
    const badges = usePage().props.adminBadges;
    const cards: { label: string; value: number; note: string; icon: LucideIcon; tone: string; href: string }[] = [
        { label: 'Pengguna terdaftar', value: stats.total, note: `+${stats.newThisWeek} minggu ini`, icon: Users, tone: 'bg-brand/10 text-brand', href: admin.users.index.url() },
        { label: 'Menunggu verifikasi', value: badges?.verification ?? 0, note: 'Mitra & mentor', icon: BadgeCheck, tone: 'bg-sky-500/10 text-sky-600', href: admin.verifications.index.url() },
        { label: 'Menunggu moderasi', value: badges?.moderation ?? 0, note: 'Beasiswa, kelas, lowongan', icon: ShieldCheck, tone: 'bg-amber-500/10 text-amber-600', href: admin.moderation.index.url() },
        { label: 'Laporan terbuka', value: badges?.reports ?? 0, note: 'Perlu ditindaklanjuti', icon: Flag, tone: 'bg-cta/10 text-cta', href: admin.reports.index.url() },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {cards.map((card, i) => (
                <Link key={card.label} href={card.href} prefetch className="block">
                    <Panel index={i} className="p-4 transition-shadow hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-black/50">{card.label}</span>
                            <span className={cn('flex size-8 items-center justify-center rounded-lg', card.tone)}>
                                <card.icon className="size-4" />
                            </span>
                        </div>
                        <div className="mt-2 text-3xl font-semibold tracking-tight">
                            <CountUp to={card.value} />
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-black/45">{card.note}</p>
                    </Panel>
                </Link>
            ))}
        </div>
    );
}

function SignupChart({ signups, stats }: { signups: Props['signups']; stats: UserStats }) {
    const max = Math.max(1, ...signups.map((s) => s.count));
    const total = signups.reduce((sum, s) => sum + s.count, 0);
    const day = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });

    return (
        <Panel index={4} className="xl:col-span-2">
            <PanelHeader title="Pendaftaran pengguna" subtitle="14 hari terakhir" action={<SeeAll href={admin.analytics.url()} />} />
            <div className="mb-4 flex flex-wrap gap-6">
                {[
                    ['Periode ini', total],
                    ['Peserta', stats.roles.peserta],
                    ['Mentor', stats.roles.mentor],
                    ['Ditangguhkan', stats.suspended],
                ].map(([label, value]) => (
                    <div key={label}>
                        <p className="text-[11.5px] text-black/45">{label}</p>
                        <p className="text-2xl font-semibold tracking-tight">{value}</p>
                    </div>
                ))}
            </div>
            <div className="flex h-40 items-end gap-1.5">
                {signups.map((s, i) => (
                    <div key={s.date} className="group relative flex h-full flex-1 flex-col justify-end">
                        <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-ink px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {day.format(new Date(s.date))}: {s.count}
                        </span>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(3, (s.count / max) * 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.03, ease: easeOut }}
                            className={cn('w-full rounded-t-md transition-colors', i === signups.length - 1 ? 'bg-brand' : 'bg-brand/25 group-hover:bg-brand/50')}
                        />
                    </div>
                ))}
            </div>
        </Panel>
    );
}

function Verifications({ organizations, mentors }: { organizations: OrganizationRow[]; mentors: MentorRow[] }) {
    const empty = organizations.length + mentors.length === 0;

    return (
        <Panel index={5}>
            <PanelHeader title="Verifikasi" subtitle="Mitra & mentor baru" action={<SeeAll href={admin.verifications.index.url()} />} />
            {empty ? (
                <EmptyState icon={BadgeCheck} title="Tidak ada antrean" />
            ) : (
                <ul className="space-y-2">
                    {organizations.map((o) => (
                        <li key={`o${o.id}`} className="flex items-center gap-3 rounded-xl border border-black/5 p-2.5">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                                <Building2 className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[12.5px] font-medium">{o.name}</p>
                                <p className="text-[11px] text-black/45">Mitra · {timeAgo(o.created_at)}</p>
                            </div>
                            <ApproveButton url={admin.verifications.organizations.update.url(o.id)} label="Verifikasi mitra" />
                        </li>
                    ))}
                    {mentors.map((m) => (
                        <li key={`m${m.id}`} className="flex items-center gap-3 rounded-xl border border-black/5 p-2.5">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-[11px] font-semibold text-brand">
                                {m.user.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((w) => w[0])
                                    .join('')}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[12.5px] font-medium">{m.user.name}</p>
                                <p className="truncate text-[11px] text-black/45">
                                    Mentor · {m.expertise} · {m.years_experience} th
                                </p>
                            </div>
                            <ApproveButton url={admin.verifications.mentors.update.url(m.id)} label="Verifikasi mentor" />
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}

function ModerationQueue({ items }: { items: OpportunityRow[] }) {
    return (
        <Panel index={6} className="xl:col-span-2">
            <PanelHeader title="Antrean moderasi" subtitle="Konten terbaru yang menunggu ditinjau" action={<SeeAll href={admin.moderation.index.url()} />} />
            {items.length === 0 ? (
                <EmptyState icon={ShieldCheck} title="Semua konten sudah ditinjau" />
            ) : (
                <ul className="divide-y divide-black/5">
                    {items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 py-3">
                            <Badge tone={typeTone[item.type]}>{typeLabels[item.type]}</Badge>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium">{item.title}</p>
                                <p className="truncate text-[11.5px] text-black/45">
                                    {item.organization?.name ?? 'Tanpa mitra'} · {timeAgo(item.created_at)}
                                </p>
                            </div>
                            <ApproveButton url={admin.moderation.update.url(item.id)} label="Setujui" />
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}

function Reports({ reports }: { reports: ReportRow[] }) {
    return (
        <Panel index={7}>
            <PanelHeader title="Laporan terbuka" subtitle="Konten yang dilaporkan" action={<SeeAll href={admin.reports.index.url()} />} />
            {reports.length === 0 ? (
                <EmptyState icon={Flag} title="Tidak ada laporan terbuka" />
            ) : (
                <ul className="space-y-2">
                    {reports.map((r) => (
                        <li key={r.id} className="rounded-xl border border-black/5 p-3">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-[12.5px] leading-snug font-medium">{r.opportunity.title}</p>
                                <Badge tone={severityTone[r.severity]}>{severityLabels[r.severity]}</Badge>
                            </div>
                            <p className="mt-1 text-[11px] text-black/45">
                                {r.reason} · {timeAgo(r.created_at)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}

function LatestUsers({ users }: { users: AdminUser[] }) {
    return (
        <Panel index={8} className="xl:col-span-2">
            <PanelHeader title="Pengguna terbaru" action={<SeeAll href={admin.users.index.url()} />} />
            <ul className="divide-y divide-black/5">
                {users.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 py-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-[11px] font-semibold text-brand">
                            <UserPlus className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium">{u.name}</p>
                            <p className="truncate text-[11.5px] text-black/45">{u.email}</p>
                        </div>
                        <RoleBadges roles={u.roles} />
                        <span className="hidden w-24 text-right text-[11.5px] text-black/40 sm:block">{timeAgo(u.created_at)}</span>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

function RecentActivity({ logs }: { logs: AuditLogRow[] }) {
    return (
        <Panel index={9}>
            <PanelHeader title="Aktivitas terbaru" subtitle="Audit log" action={<SeeAll href={admin.auditLogs.index.url()} />} />
            {logs.length === 0 ? (
                <EmptyState icon={Activity} title="Belum ada aktivitas" />
            ) : (
                <ol className="relative space-y-4 before:absolute before:top-1 before:bottom-1 before:left-[7px] before:w-px before:bg-black/10">
                    {logs.map((log) => (
                        <li key={log.id} className="relative flex gap-3 pl-6">
                            <span className="absolute top-1 left-0 size-[15px] rounded-full border-[3px] border-white bg-brand shadow-[0_0_0_1px_rgba(139,92,246,0.3)]" />
                            <p className="min-w-0 flex-1 text-[12px] leading-snug">
                                <span className="font-medium">{log.user?.name ?? 'Sistem'}</span> <span className="text-black/55">{log.description}</span>
                            </p>
                            <span className="shrink-0 text-[10.5px] text-black/40">{timeAgo(log.created_at)}</span>
                        </li>
                    ))}
                </ol>
            )}
        </Panel>
    );
}

export default function AdminDashboard(props: Props) {
    const badges = usePage().props.adminBadges;

    return (
        <>
            <Head title="Panel Admin" />
            <Greeting message="Berikut ringkasan kondisi platform hari ini.">
                <Chip icon={ShieldCheck} delay={0.45} className="border-amber-500/20 bg-amber-500/[0.07] text-amber-700">
                    {badges?.moderation ?? 0} konten menunggu moderasi
                </Chip>
                <Chip icon={BadgeCheck} delay={0.53} className="border-brand/15 bg-brand/[0.06] text-brand-dark">
                    {badges?.verification ?? 0} permintaan verifikasi
                </Chip>
                <Chip icon={Flag} delay={0.61} className="border-cta/15 bg-cta/[0.06] text-cta">
                    {badges?.reports ?? 0} laporan terbuka
                </Chip>
            </Greeting>

            <Kpis stats={props.userStats} />

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <SignupChart signups={props.signups} stats={props.userStats} />
                <Verifications organizations={props.pendingOrganizations} mentors={props.pendingMentors} />
                <ModerationQueue items={props.pendingOpportunities} />
                <Reports reports={props.openReports} />
                <LatestUsers users={props.latestUsers} />
                <RecentActivity logs={props.recentActivity} />
            </div>
        </>
    );
}

AdminDashboard.layout = AdminLayout;
