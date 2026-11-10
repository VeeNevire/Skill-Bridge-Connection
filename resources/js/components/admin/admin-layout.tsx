import { usePage } from '@inertiajs/react';
import { BadgeCheck, BriefcaseBusiness, Building2, ChartLine, Flag, Globe, GraduationCap, LayoutGrid, ScrollText, Settings, ShieldCheck, Tags, Users } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import type { NavItem } from '@/components/dashboard/dashboard-layout';
import admin from '@/routes/admin';
import { FlashToast } from './ui';

function SystemStatusCard() {
    return (
        <div className="rounded-2xl border border-black/5 bg-white p-4">
            <div className="flex items-center gap-2 text-[12px] font-medium">
                <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Semua layanan normal
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-black/45">Tinjau verifikasi dan moderasi setiap hari agar katalog tetap terpercaya.</p>
        </div>
    );
}

/**
 * Persistent layout for every admin page: the sidebar stays mounted between visits,
 * so its active indicator animates and badge counts update without a full re-render.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();
    const badges = props.adminBadges;
    const path = url.split('?')[0];

    const nav: NavItem[] = [
        { key: '/admin', label: 'Ringkasan', icon: LayoutGrid, href: admin.dashboard.url() },
        { key: '/admin/pengguna', label: 'Pengguna', icon: Users, href: admin.users.index.url() },
        { key: '/admin/verifikasi', label: 'Verifikasi', icon: BadgeCheck, href: admin.verifications.index.url(), badge: badges?.verification },
        { key: '/admin/moderasi', label: 'Moderasi Konten', icon: ShieldCheck, href: admin.moderation.index.url(), badge: badges?.moderation },
        { key: '/admin/laporan', label: 'Laporan', icon: Flag, href: admin.reports.index.url(), badge: badges?.reports },
        { key: '/admin/kategori', label: 'Kategori', icon: Tags, href: admin.categories.index.url() },
        {
            key: '/admin/scraper',
            label: 'Scraper',
            icon: Globe,
            children: [
                { key: '/admin/scraper/beasiswa', label: 'Beasiswa', icon: GraduationCap, href: admin.scrapers.index.url('beasiswa') },
                { key: '/admin/scraper/magang', label: 'Magang', icon: Building2, href: admin.scrapers.index.url('magang') },
                { key: '/admin/scraper/lowongan', label: 'Karier', icon: BriefcaseBusiness, href: admin.scrapers.index.url('lowongan') },
            ],
        },
        { key: '/admin/audit-log', label: 'Audit Log', icon: ScrollText, href: admin.auditLogs.index.url() },
        { key: '/admin/analitik', label: 'Analitik', icon: ChartLine, href: admin.analytics.url() },
    ];
    const accountNav: NavItem[] = [{ key: '/admin/pengaturan', label: 'Pengaturan', icon: Settings, href: admin.settings.edit.url() }];

    // Longest matching prefix wins, so /admin does not swallow /admin/pengguna.
    const active =
        [...nav, ...nav.flatMap((n) => n.children ?? []), ...accountNav]
            .map((n) => n.key)
            .filter((key) => path === key || path.startsWith(`${key}/`))
            .sort((a, b) => b.length - a.length)[0] ?? '/admin';

    return (
        <MotionConfig reducedMotion="user">
            <DashboardLayout
                nav={nav}
                accountNav={accountNav}
                active={active}
                tour="admin"
                footer={<SystemStatusCard />}
                searchPlaceholder="Cari pengguna, konten, laporan…"
            >
                {children}
            </DashboardLayout>
            <FlashToast />
        </MotionConfig>
    );
}
