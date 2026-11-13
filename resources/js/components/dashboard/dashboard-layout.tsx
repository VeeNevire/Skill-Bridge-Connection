import { Link, router, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { easeOut } from "@/components/landing/blur-text";
import { ChevronDown, CircleHelp, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
    BellIcon,
    CrossIcon,
    LogoMark,
    LogoutIcon,
    MenuIcon,
    SearchIcon,
} from "@/components/landing/icons";
import { brand } from "@/data/landing";
import { tours } from "@/data/tours";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { home, logout } from "@/routes";
import { index as catalogIndex } from "@/routes/catalog";
import { dashboard as mentorDashboard } from "@/routes/mentor";
import { dashboard as partnerDashboard } from "@/routes/partner";
import { dashboard as companyDashboard } from "@/routes/company";
import { index as applicationsIndex } from "@/routes/applications";
import { index as usersIndex } from "@/routes/admin/users";
import { index as mentoringIndex } from "@/routes/mentoring";
import { complete as completeTour } from "@/routes/tours";
import type { UserRole } from "@/types";
import { RoleSwitcher } from "./role-switcher";
import { DashboardClock } from "./dashboard-clock";
import { ProductTour } from "./product-tour";

function useClickOutside(onOutside: () => void) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handle = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onOutside();
            }
        };

        document.addEventListener("mousedown", handle);

        return () => document.removeEventListener("mousedown", handle);
    }, [onOutside]);

    return ref;
}

/** Talent Passport progress card shown at the bottom of the participant sidebar. */
export function ProfileSidebarCard() {
    const currentUser = useCurrentUser();

    return (
        <div className="rounded-xl bg-surface p-3.5">
            <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium">Talent Passport</span>
                <span className="text-black/45">
                    {currentUser.profileCompletion}%
                </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <motion.div
                    className="h-full rounded-full bg-brand"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentUser.profileCompletion}%` }}
                    transition={{ duration: 1.2, delay: 0.4, ease: easeOut }}
                />
            </div>
            <p className="mt-2 text-[11px] leading-snug text-black/45">
                Lengkapi profil untuk rekomendasi yang lebih tepat.
            </p>
        </div>
    );
}

/** A sidebar entry: with `href` it navigates (prefetched on hover), otherwise it calls `onSelect`. */
export type NavItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
    /** "danger" paints the badge red, for counts that need action now (e.g. open reports). */
    tone?: "danger";
    /** Red dot for a problem that has no count, such as a failing scraper. */
    alert?: boolean;
    href?: string;
    /** Heading this entry sits under; a new heading starts whenever it changes. Defaults to "Menu". */
    section?: string;
    /** Second key of the "G then <key>" shortcut that opens this entry. */
    shortcut?: string;
    /** Sub-entries shown indented under this one; the parent then only toggles them open. */
    children?: NavItem[];
};

type SidebarProps = {
    nav: NavItem[];
    accountNav: NavItem[];
    active: string;
    onSelect?: (key: string) => void;
    /** Bottom card. A function also gets whether the sidebar is collapsed to icons; plain nodes are hidden then. */
    footer?: ReactNode | ((collapsed: boolean) => ReactNode);
};

const COLLAPSED_KEY = "sidebar-collapsed";

function KeyHint({ keys, dark = false }: { keys: string[]; dark?: boolean }) {
    return (
        <span className="flex gap-0.5">
            {keys.map((key, i) => (
                <kbd
                    key={i}
                    className={cn(
                        "min-w-4 rounded border px-1 text-center font-sans text-[10px] leading-4",
                        dark ? "border-white/20 text-white/70" : "border-black/10 text-black/40",
                    )}
                >
                    {key}
                </kbd>
            ))}
        </span>
    );
}

/** Label shown beside an icon-only control while the sidebar is collapsed. */
function SidebarTip({ label, keys }: { label: string; keys?: string[] }) {
    return (
        <span
            role="tooltip"
            className="pointer-events-none absolute top-1/2 left-full z-50 ml-4 hidden -translate-y-1/2 items-center gap-2 rounded-lg bg-ink px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-white shadow-lg group-hover:flex group-focus-visible:flex"
        >
            {label}
            {keys && <KeyHint keys={keys} dark />}
        </span>
    );
}

function shortcutKeys(shortcut?: string) {
    return shortcut ? ["G", shortcut.toUpperCase()] : undefined;
}

/** Splits entries into consecutive runs that share a section heading. */
function sectionsOf(items: NavItem[], fallback: string) {
    const sections: { title: string; items: NavItem[] }[] = [];

    for (const navItem of items) {
        const title = navItem.section ?? fallback;
        const last = sections.at(-1);

        if (last?.title === title) last.items.push(navItem);
        else sections.push({ title, items: [navItem] });
    }

    return sections;
}

function SidebarContent({
    nav,
    accountNav,
    active,
    onSelect,
    footer,
    collapsed = false,
    onToggleCollapse,
}: SidebarProps & { collapsed?: boolean; onToggleCollapse?: () => void }) {
    const [openGroups, setOpenGroups] = useState<string[]>([]);
    // The highlight pill follows the pointer (or keyboard focus) and returns to the active entry on leave.
    // Entries also sink softly on press and spring back on release, driven by a spring so it never snaps.
    const [hovered, setHovered] = useState<string | null>(null);
    const pillId = `sidebar-pill-${useId()}`;
    // Collapsed groups hide their children, so an active child lights up its parent instead.
    const activeTarget = collapsed
        ? (nav.find((n) => n.children?.some((c) => c.key === active))?.key ?? active)
        : active;
    const pillKey = hovered ?? activeTarget;
    const track = (key: string) => ({
        onMouseEnter: () => setHovered(key),
        onFocus: () => setHovered(key),
    });
    const tap = { whileTap: { scale: 0.97 }, transition: { type: "spring", stiffness: 380, damping: 22, mass: 0.7 } } as const;
    const pill = (
        <motion.span
            layoutId={pillId}
            transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.6 }}
            className="absolute inset-0 rounded-xl bg-brand/10"
        />
    );

    /** `tracked` is off inside the collapsed flyout, which sits outside the pill's path. */
    const item = (navItem: NavItem, iconOnly = collapsed, tracked = true) => {
        const { key, label, icon: Icon, badge, tone, alert, href, shortcut } = navItem;
        const isActive = active === key;
        const hasBadge = badge !== undefined && badge > 0;
        const urgent = tone === "danger" || alert;
        const className = cn(
            "group relative flex w-full items-center gap-3 rounded-xl py-2 text-[13.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/40",
            iconOnly ? "justify-center px-0" : "px-3",
            isActive ? "font-medium text-brand-dark" : "text-black/60 hover:text-ink",
            !tracked && (isActive ? "bg-brand/10" : "hover:bg-black/[0.04]"),
        );
        const content = (
            <>
                {tracked && pillKey === key && pill}
                <span className="relative">
                    <Icon className={cn("size-[18px]", isActive && "text-brand")} />
                    {iconOnly && (hasBadge || alert) && (
                        <span
                            className={cn(
                                "absolute -top-1 -right-1 size-2 rounded-full ring-2 ring-white",
                                urgent ? "bg-cta" : "bg-brand",
                            )}
                        />
                    )}
                </span>
                {!iconOnly && (
                    <>
                        <span className="relative truncate">{label}</span>
                        {alert && (
                            <span className="relative size-1.5 shrink-0 rounded-full bg-cta">
                                <span className="sr-only">Perlu perhatian</span>
                            </span>
                        )}
                        {hasBadge ? (
                            <span
                                className={cn(
                                    "relative ml-auto rounded-full px-1.5 py-px text-[10.5px] font-semibold tabular-nums",
                                    tone === "danger" ? "bg-cta/10 text-cta" : "bg-brand/10 text-brand-dark",
                                )}
                            >
                                {badge}
                            </span>
                        ) : (
                            shortcut && (
                                <span className="relative ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                                    <KeyHint keys={shortcutKeys(shortcut)!} />
                                </span>
                            )
                        )}
                    </>
                )}
                {iconOnly && (
                    <SidebarTip label={hasBadge ? `${label} · ${badge}` : label} keys={shortcutKeys(shortcut)} />
                )}
            </>
        );

        return (
            // Tracked on the <li>: Inertia's Link sets its own onMouseEnter (for prefetch) and drops ours.
            <motion.li key={key} data-tour={`nav-${key}`} {...tap} {...(tracked ? track(key) : {})}>
                {href ? (
                    <Link
                        href={href}
                        prefetch
                        aria-label={iconOnly ? label : undefined}
                        onClick={() => onSelect?.(key)}
                        className={className}
                    >
                        {content}
                    </Link>
                ) : (
                    <button
                        type="button"
                        aria-label={iconOnly ? label : undefined}
                        onClick={() => onSelect?.(key)}
                        className={className}
                    >
                        {content}
                    </button>
                )}
            </motion.li>
        );
    };

    const group = (parent: NavItem) => {
        const children = parent.children ?? [];
        const hasActive = children.some((child) => child.key === active);
        const open = hasActive || openGroups.includes(parent.key);
        const Icon = parent.icon;

        // Collapsed: no room to indent, so the children open in a flyout on hover or focus.
        if (collapsed) {
            return (
                <li key={parent.key} data-tour={`nav-${parent.key}`} className="group/flyout relative">
                    <motion.button
                        type="button"
                        {...tap}
                        aria-label={parent.label}
                        aria-haspopup="true"
                        {...track(parent.key)}
                        className={cn(
                            "relative flex w-full items-center justify-center rounded-xl py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/40",
                            hasActive ? "text-brand" : "text-black/60 hover:text-ink",
                        )}
                    >
                        {pillKey === parent.key && pill}
                        <span className="relative">
                            <Icon className="size-[18px]" />
                            {parent.alert && (
                                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-cta ring-2 ring-white" />
                            )}
                        </span>
                    </motion.button>
                    <div className="invisible absolute top-0 left-full z-50 pl-4 opacity-0 transition-opacity group-focus-within/flyout:visible group-focus-within/flyout:opacity-100 group-hover/flyout:visible group-hover/flyout:opacity-100">
                        <div className="w-56 rounded-2xl border border-black/5 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]">
                            <p className="px-3 pt-1.5 pb-1 text-[11px] font-medium text-black/40">
                                {parent.label}
                            </p>
                            <ul className="space-y-0.5">{children.map((child) => item(child, false, false))}</ul>
                        </div>
                    </div>
                </li>
            );
        }

        return (
            <li key={parent.key} data-tour={`nav-${parent.key}`}>
                <motion.button
                    type="button"
                    {...tap}
                    aria-expanded={open}
                    onClick={() =>
                        setOpenGroups((keys) =>
                            keys.includes(parent.key)
                                ? keys.filter((k) => k !== parent.key)
                                : [...keys, parent.key],
                        )
                    }
                    {...track(parent.key)}
                    className={cn(
                        "relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/40",
                        hasActive ? "font-medium text-ink" : "text-black/60",
                    )}
                >
                    {pillKey === parent.key && pill}
                    <Icon className={cn("relative size-[18px]", hasActive && "text-brand")} />
                    <span className="relative">{parent.label}</span>
                    {parent.alert && (
                        <span className="relative size-1.5 rounded-full bg-cta">
                            <span className="sr-only">Perlu perhatian</span>
                        </span>
                    )}
                    <ChevronDown
                        className={cn("relative ml-auto size-4 text-black/35 transition-transform", open && "rotate-180")}
                    />
                </motion.button>
                {open && (
                    <ul className="mt-0.5 ml-5 space-y-0.5 border-l border-black/5 pl-2">
                        {children.map((child) => item(child))}
                    </ul>
                )}
            </li>
        );
    };
    const entry = (navItem: NavItem) => (navItem.children?.length ? group(navItem) : item(navItem));

    const sectionList = (items: NavItem[], fallback: string, first: boolean) =>
        sectionsOf(items, fallback).map((section, i) => (
            <div key={section.title}>
                {collapsed ? (
                    !(first && i === 0) && <div className="mx-2 my-3 h-px bg-black/5" />
                ) : (
                    <p
                        className={cn(
                            "mb-1.5 px-3 text-[11px] font-medium tracking-wide text-black/35 uppercase",
                            !(first && i === 0) && "mt-5",
                        )}
                    >
                        {section.title}
                    </p>
                )}
                <ul className="space-y-0.5">{section.items.map(entry)}</ul>
            </div>
        ));

    const footerNode = typeof footer === "function" ? footer(collapsed) : collapsed ? null : footer;
    const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

    const toggle = onToggleCollapse && (
        <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Perluas menu" : "Ciutkan menu"}
            aria-pressed={collapsed}
            className={cn(
                "group relative flex size-8 shrink-0 items-center justify-center rounded-lg text-black/40 outline-none transition-colors hover:bg-black/[0.04] hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/40",
                collapsed && "mx-auto mt-3",
            )}
        >
            <ToggleIcon className="size-[18px]" />
            <SidebarTip label={collapsed ? "Perluas menu" : "Ciutkan menu"} keys={["["]} />
        </button>
    );

    return (
        <div className="flex h-full flex-col">
            <div className={cn("flex", collapsed ? "flex-col" : "items-center gap-2 pr-1")}>
                <Link
                    href={home()}
                    aria-label={brand.name}
                    className={cn("flex h-11 min-w-0 items-center gap-2", collapsed ? "justify-center" : "px-2")}
                >
                    <LogoMark className="size-8 shrink-0" />
                    {!collapsed && (
                        // Wordmark as text: the horizontal PNG is cropped and blurs at sidebar size.
                        <span className="flex flex-col text-[15px] leading-[1.05] font-extrabold tracking-tight">
                            <span className="text-ink">{brand.name}</span>
                            <span className="text-brand-dark">Connect</span>
                        </span>
                    )}
                </Link>
                {!collapsed && <span className="flex-1" />}
                {toggle}
            </div>

            {/* Scrolling would clip the collapsed tooltips and flyouts, which hang outside the sidebar. */}
            <nav
                aria-label="Navigasi utama"
                onMouseLeave={() => setHovered(null)}
                onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(null);
                }}
                className={cn(
                    "mt-6 min-h-0 flex-1",
                    !collapsed &&
                        "-mx-1 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                )}
            >
                {sectionList(nav, "Menu", true)}
                {sectionList(accountNav, "Akun", false)}
            </nav>

            {footerNode && <div className="mt-4">{footerNode}</div>}

            <Link
                href={logout()}
                as="button"
                aria-label={collapsed ? "Keluar" : undefined}
                className={cn(
                    "group relative mt-2 flex w-full items-center gap-3 rounded-xl py-2 text-[13px] text-black/50 outline-none transition-colors hover:bg-cta/5 hover:text-cta focus-visible:ring-2 focus-visible:ring-cta/30",
                    collapsed ? "justify-center" : "px-3",
                )}
            >
                <LogoutIcon className="size-[18px]" />
                {collapsed ? <SidebarTip label="Keluar" /> : <span>Keluar</span>}
            </Link>
        </div>
    );
}

function NotificationMenu() {
    const [open, setOpen] = useState(false);
    const ref = useClickOutside(() => setOpen(false));
    const notifications = usePage().props.accountActivity ?? [];

    return (
        <div ref={ref} className="relative" data-tour="notifications">
            <button
                type="button"
                aria-label="Notifikasi"
                onClick={() => setOpen((v) => !v)}
                className="relative flex size-10 items-center justify-center rounded-xl border border-black/5 bg-white text-black/60 transition-colors hover:text-ink"
            >
                <BellIcon className="size-[18px]" />
                {notifications.length > 0 && (
                    <span className="absolute top-2 right-2.5 size-2 rounded-full bg-cta ring-2 ring-white" />
                )}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: easeOut }}
                        className="absolute right-0 z-40 mt-2 w-80 origin-top-right rounded-2xl border border-black/5 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]"
                    >
                        <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-[13px] font-semibold">Notifikasi</span>
                            <span className="text-[11px] text-black/40">
                                {notifications.length} aktivitas
                            </span>
                        </div>
                        <ul>
                            {notifications.length === 0 && (
                                <li className="px-3 py-4 text-xs text-black/45">
                                    Belum ada aktivitas atau pengingat.
                                </li>
                            )}
                            {notifications.map((n) => (
                                <li
                                    key={n.title + n.time}
                                    className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-50"
                                >
                                    <span
                                        className={cn(
                                            "mt-1.5 size-2 shrink-0 rounded-full",
                                            "bg-brand",
                                        )}
                                    />
                                    <div>
                                        <Link
                                            href={n.href}
                                            className="text-[12.5px] leading-snug hover:text-brand"
                                        >
                                            {n.title}
                                        </Link>
                                        <p className="mt-0.5 text-[11px] text-black/40">
                                            {new Date(n.time).toLocaleDateString("id-ID")}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function UserMenu() {
    const [open, setOpen] = useState(false);
    const ref = useClickOutside(() => setOpen(false));
    const currentUser = useCurrentUser();

    return (
        <div ref={ref} className="relative" data-tour="account">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-white py-1 pr-3 pl-1 transition-colors hover:bg-zinc-50"
            >
                {currentUser.avatar ? (
                    <img
                        src={currentUser.avatar}
                        alt=""
                        className="size-8 rounded-lg object-cover"
                    />
                ) : (
                    <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-[12px] font-semibold text-brand">
                        {currentUser.initials}
                    </span>
                )}
                <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-[12.5px] font-medium">{currentUser.name}</span>
                    <span className="block text-[11px] text-black/45">{currentUser.role}</span>
                </span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: easeOut }}
                        className="absolute right-0 z-40 mt-2 w-56 origin-top-right rounded-2xl border border-black/5 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]"
                    >
                        <div className="px-3 py-2">
                            <p className="text-[13px] font-medium">{currentUser.name}</p>
                            <p className="text-[11px] text-black/45">{currentUser.email}</p>
                        </div>
                        <div className="my-1 h-px bg-black/5" />
                        <Link
                            href={logout()}
                            as="button"
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-cta transition-colors hover:bg-cta/5"
                        >
                            <LogoutIcon className="size-4" />
                            Keluar
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function DashboardLayout({
    searchPlaceholder,
    search: searchSlot,
    children,
    onSelect,
    tour,
    ...sidebar
}: SidebarProps & {
    searchPlaceholder: string;
    /** Replaces the default submit-to-filter search box, e.g. with an instant-results search. */
    search?: ReactNode;
    children: ReactNode;
    /** The role whose guided tour this dashboard offers; it starts by itself until finished or skipped once. */
    tour?: UserRole;
}) {
    const [drawer, setDrawer] = useState(false);
    const [touring, setTouring] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return window.localStorage.getItem(COLLAPSED_KEY) === "1";
        } catch {
            return false;
        }
    });
    const toggleCollapsed = useCallback(() => {
        setCollapsed((value) => {
            try {
                window.localStorage.setItem(COLLAPSED_KEY, value ? "0" : "1");
            } catch {
                // Private mode or blocked storage: the choice just lasts until reload.
            }

            return !value;
        });
    }, []);
    const page = usePage();
    const seen = !tour || (page.props.auth.user?.completed_tours ?? []).includes(tour);

    useEffect(() => {
        if (seen) return;

        // Let the entrance animations settle before dimming the page.
        const timer = window.setTimeout(() => setTouring(true), 700);

        return () => window.clearTimeout(timer);
        // Only on first mount: replaying is done from the Panduan button.
    }, []);

    const closeTour = useCallback(() => {
        setTouring(false);

        if (tour && !seen) {
            router.post(
                completeTour.url(tour),
                {},
                { preserveScroll: true, preserveState: true, only: ["auth"] },
            );
        }
    }, [seen, tour]);
    const pageUrl = page.url.split("?")[0];
    const organization = new URLSearchParams(page.url.split("?")[1]).get("organization");
    const search = (query: string) => {
        if (pageUrl === mentorDashboard.url())
            router.get(mentorDashboard.url(), {
                q: query,
                section: "requests",
            });
        else if (pageUrl === partnerDashboard.url())
            router.get(partnerDashboard.url(), {
                q: query,
                section: "programs",
                organization,
            });
        else if (pageUrl === companyDashboard.url())
            router.get(companyDashboard.url(), {
                q: query,
                section: "jobs",
                organization,
            });
        else if (pageUrl === mentoringIndex.url()) router.get(mentoringIndex.url(), { q: query });
        else if (pageUrl.startsWith(applicationsIndex.url()))
            router.get(applicationsIndex.url(), { q: query });
        else if (pageUrl.startsWith(usersIndex.url().split("/").slice(0, 2).join("/")))
            router.get(usersIndex.url(), { q: query });
        else
            router.get(
                catalogIndex.url(
                    pageUrl === catalogIndex.url("kelas")
                        ? "kelas"
                        : pageUrl === catalogIndex.url("lowongan")
                          ? "lowongan"
                          : pageUrl === catalogIndex.url("magang")
                            ? "magang"
                            : "beasiswa",
                ),
                { q: query },
            );
    };

    const select = (key: string) => {
        onSelect?.(key);
        setDrawer(false);
    };
    const selectRef = useRef(select);
    selectRef.current = select;

    // Keyboard: "/" focuses search, "[" collapses the sidebar, "G" then a letter opens a page.
    useEffect(() => {
        let pendingG = 0;
        const entries = [...sidebar.nav, ...sidebar.nav.flatMap((n) => n.children ?? []), ...sidebar.accountNav];
        const handle = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;

            if (
                touring ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                target?.isContentEditable ||
                ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
            ) {
                return;
            }

            const key = event.key.toLowerCase();

            if (pendingG && Date.now() - pendingG < 1500) {
                pendingG = 0;
                const match = entries.find((n) => n.shortcut?.toLowerCase() === key);

                if (match) {
                    event.preventDefault();
                    if (match.href) router.visit(match.href);
                    selectRef.current(match.key);
                }

                return;
            }

            if (key === "g") pendingG = Date.now();
            else if (key === "/") {
                const input = document.querySelector<HTMLInputElement>("[data-search-input]");

                if (input?.offsetParent) {
                    event.preventDefault();
                    input.focus();
                }
            } else if (key === "[") toggleCollapsed();
        };

        window.addEventListener("keydown", handle);

        return () => window.removeEventListener("keydown", handle);
    }, [sidebar.nav, sidebar.accountNav, touring, toggleCollapsed]);

    return (
        <div className="min-h-screen bg-surface font-sans text-ink antialiased">
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 hidden border-r border-black/[0.06] bg-white px-3 py-4 transition-[width] duration-300 ease-out lg:block",
                    collapsed ? "w-[72px]" : "w-64",
                )}
            >
                <SidebarContent
                    {...sidebar}
                    onSelect={select}
                    collapsed={collapsed}
                    onToggleCollapse={toggleCollapsed}
                />
            </aside>

            <AnimatePresence>
                {drawer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawer(false)}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{
                                type: "spring",
                                stiffness: 320,
                                damping: 34,
                            }}
                            className="fixed inset-y-0 left-0 z-50 w-72 rounded-r-2xl bg-white p-4 shadow-2xl lg:hidden"
                        >
                            <button
                                type="button"
                                aria-label="Tutup menu"
                                onClick={() => setDrawer(false)}
                                className="absolute top-4 right-4 rounded-lg p-1.5 text-black/50 hover:bg-black/5"
                            >
                                <CrossIcon className="size-4" />
                            </button>
                            <SidebarContent {...sidebar} onSelect={select} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className={cn("transition-[padding] duration-300 ease-out", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
                <header className="sticky top-0 z-30 bg-surface/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2">
                        <button
                            type="button"
                            aria-label="Buka menu"
                            onClick={() => setDrawer(true)}
                            className="flex size-10 items-center justify-center rounded-xl border border-black/5 bg-white lg:hidden"
                        >
                            <MenuIcon className="size-5" />
                        </button>
                        {searchSlot ?? (
                        <form
                            role="search"
                            data-tour="search"
                            onSubmit={(event) => {
                                event.preventDefault();
                                search(
                                    String(new FormData(event.currentTarget).get("q") ?? "").trim(),
                                );
                            }}
                            className="hidden h-10 max-w-sm min-w-0 flex-1 items-center gap-2 rounded-xl border border-black/5 bg-white px-3 text-black/40 focus-within:border-brand/40 sm:flex"
                        >
                            <SearchIcon className="size-4 shrink-0" />
                            <input
                                data-search-input
                                name="q"
                                aria-label={searchPlaceholder}
                                placeholder={searchPlaceholder}
                                className="w-full min-w-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-black/35"
                            />
                            <kbd className="rounded-md border border-black/10 px-1.5 text-[10px]">
                                /
                            </kbd>
                        </form>
                        )}
                        <DashboardClock />
                        <div className="ml-auto flex items-center gap-2">
                            {tour && (
                                <button
                                    type="button"
                                    data-tour="help"
                                    aria-label="Panduan"
                                    onClick={() => setTouring(true)}
                                    className="flex h-10 items-center gap-2 rounded-xl border border-black/5 bg-white px-2.5 text-[12.5px] text-black/60 transition-colors hover:text-ink sm:px-3"
                                >
                                    <CircleHelp className="size-[18px]" />
                                    <span className="hidden sm:inline">Panduan</span>
                                </button>
                            )}
                            <RoleSwitcher />
                            <NotificationMenu />
                            <UserMenu />
                        </div>
                    </div>
                </header>
                <main className="px-4 pb-10 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1600px]">{children}</div>
                </main>
            </div>

            {touring && tour && <ProductTour steps={tours[tour]} onClose={closeTour} />}
        </div>
    );
}
