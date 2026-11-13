import { usePage } from "@inertiajs/react";
import {
    BadgeCheck,
    BriefcaseBusiness,
    Building2,
    ChartLine,
    Flag,
    Globe,
    GraduationCap,
    LayoutGrid,
    Link2,
    ScrollText,
    Settings,
    ShieldCheck,
    Tags,
    Users,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import type { NavItem } from "@/components/dashboard/dashboard-layout";
import { cn } from "@/lib/utils";
import admin from "@/routes/admin";
import { AdminSearch } from "./admin-search";
import { FlashToast } from "./ui";

const relativeTime = new Intl.RelativeTimeFormat("id", { numeric: "auto" });

function timeAgo(iso: string) {
    const minutes = Math.round((Date.parse(iso) - Date.now()) / 60_000);

    if (Math.abs(minutes) < 60) return relativeTime.format(minutes, "minute");
    const hours = Math.round(minutes / 60);

    if (Math.abs(hours) < 24) return relativeTime.format(hours, "hour");

    return relativeTime.format(Math.round(hours / 24), "day");
}

const statusTones = {
    ok: { dot: "bg-emerald-500", ping: "bg-emerald-400", title: "Semua layanan normal" },
    warn: { dot: "bg-amber-500", ping: "bg-amber-400", title: "Ada laporan terbuka" },
    error: { dot: "bg-cta", ping: "bg-cta/60", title: "Scraper bermasalah" },
};

/** Live platform health: what needs attention now, and when the scraper last ran. */
function SystemStatusCard({ collapsed }: { collapsed: boolean }) {
    const badges = usePage().props.adminBadges;
    const failing = badges?.scraperFailing ?? 0;
    const reports = badges?.reports ?? 0;
    const queue = (badges?.verification ?? 0) + (badges?.moderation ?? 0);
    const tone = statusTones[failing > 0 ? "error" : reports > 0 ? "warn" : "ok"];
    const lines = [
        failing > 0 && `${failing} sumber scraper gagal saat terakhir dijalankan`,
        reports > 0 && `${reports} laporan perlu ditindaklanjuti`,
        queue > 0 && `${queue} item menunggu tinjauan`,
    ].filter((line): line is string => Boolean(line));

    const dot = (
        <span className="relative flex size-2 shrink-0">
            <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-75", tone.ping)} />
            <span className={cn("relative inline-flex size-2 rounded-full", tone.dot)} />
        </span>
    );

    if (collapsed) {
        return (
            <div title={tone.title} className="flex justify-center py-2">
                {dot}
                <span className="sr-only">{tone.title}</span>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-surface p-3.5">
            <div className="flex items-center gap-2 text-[12px] font-medium">
                {dot}
                {tone.title}
            </div>
            {lines.length > 0 ? (
                <ul className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-black/55">
                    {lines.map((line) => (
                        <li key={line}>{line}</li>
                    ))}
                </ul>
            ) : (
                <p className="mt-1.5 text-[11px] leading-snug text-black/45">
                    Tidak ada antrean. Katalog dalam kondisi baik.
                </p>
            )}
            {badges?.scraperLastRunAt && (
                <p className="mt-2.5 flex items-center gap-1.5 border-t border-black/5 pt-2 text-[11px] text-black/40">
                    <Globe className="size-3" />
                    Scraper jalan {timeAgo(badges.scraperLastRunAt)}
                </p>
            )}
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
    const path = url.split("?")[0];

    const nav: NavItem[] = [
        {
            key: "/admin",
            label: "Ringkasan",
            icon: LayoutGrid,
            href: admin.dashboard.url(),
            section: "Ikhtisar",
            shortcut: "r",
        },
        {
            key: "/admin/analitik",
            label: "Analitik",
            icon: ChartLine,
            href: admin.analytics.url(),
            section: "Ikhtisar",
            shortcut: "n",
        },
        {
            key: "/admin/pengguna",
            label: "Pengguna",
            icon: Users,
            href: admin.users.index.url(),
            section: "Manajemen",
            shortcut: "p",
        },
        {
            key: "/admin/verifikasi",
            label: "Verifikasi",
            icon: BadgeCheck,
            href: admin.verifications.index.url(),
            badge: badges?.verification,
            section: "Manajemen",
            shortcut: "v",
        },
        {
            key: "/admin/kategori",
            label: "Kategori",
            icon: Tags,
            href: admin.categories.index.url(),
            section: "Manajemen",
            shortcut: "k",
        },
        {
            key: "/admin/moderasi",
            label: "Moderasi Konten",
            icon: ShieldCheck,
            href: admin.moderation.index.url(),
            badge: badges?.moderation,
            section: "Konten & keamanan",
            shortcut: "m",
        },
        {
            key: "/admin/laporan",
            label: "Laporan",
            icon: Flag,
            href: admin.reports.index.url(),
            badge: badges?.reports,
            tone: "danger",
            section: "Konten & keamanan",
            shortcut: "l",
        },
        {
            key: "/admin/audit-log",
            label: "Audit Log",
            icon: ScrollText,
            href: admin.auditLogs.index.url(),
            section: "Konten & keamanan",
            shortcut: "a",
        },
        {
            key: "/admin/scraper",
            label: "Scraper",
            icon: Globe,
            alert: (badges?.scraperFailing ?? 0) > 0,
            section: "Sistem",
            children: [
                {
                    key: "/admin/scraper/beasiswa",
                    label: "Beasiswa",
                    icon: GraduationCap,
                    href: admin.scrapers.index.url("beasiswa"),
                },
                {
                    key: "/admin/scraper/magang",
                    label: "Magang",
                    icon: Building2,
                    href: admin.scrapers.index.url("magang"),
                },
                {
                    key: "/admin/scraper/lowongan",
                    label: "Karier",
                    icon: BriefcaseBusiness,
                    href: admin.scrapers.index.url("lowongan"),
                },
                {
                    key: "/admin/scraper/website",
                    label: "Direktori Website",
                    icon: Link2,
                    href: admin.scrapers.sites.index.url(),
                },
            ],
        },
    ];
    const accountNav: NavItem[] = [
        {
            key: "/admin/pengaturan",
            label: "Pengaturan",
            icon: Settings,
            href: admin.settings.edit.url(),
            shortcut: "s",
        },
    ];

    // Longest matching prefix wins, so /admin does not swallow /admin/pengguna.
    const active =
        [...nav, ...nav.flatMap((n) => n.children ?? []), ...accountNav]
            .map((n) => n.key)
            .filter((key) => path === key || path.startsWith(`${key}/`))
            .sort((a, b) => b.length - a.length)[0] ?? "/admin";

    return (
        <MotionConfig reducedMotion="user">
            <DashboardLayout
                nav={nav}
                accountNav={accountNav}
                active={active}
                tour="admin"
                footer={(collapsed) => <SystemStatusCard collapsed={collapsed} />}
                searchPlaceholder="Cari pengguna, konten, laporan…"
                search={<AdminSearch pages={[...nav, ...accountNav]} placeholder="Cari pengguna, konten, laporan…" />}
            >
                {children}
            </DashboardLayout>
            <FlashToast />
        </MotionConfig>
    );
}
