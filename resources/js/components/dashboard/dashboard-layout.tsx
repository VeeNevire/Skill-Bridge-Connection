import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { easeOut } from '@/components/landing/blur-text';
import { CircleHelp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    BellIcon,
    CrossIcon,
    LogoMark,
    LogoutIcon,
    MenuIcon,
    SearchIcon,
} from '@/components/landing/icons';
import { brand } from '@/data/landing';
import { tours } from '@/data/tours';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { home, logout } from '@/routes';
import { index as catalogIndex } from '@/routes/catalog';
import { dashboard as mentorDashboard } from '@/routes/mentor';
import { dashboard as partnerDashboard } from '@/routes/partner';
import { dashboard as companyDashboard } from '@/routes/company';
import { index as applicationsIndex } from '@/routes/applications';
import { index as usersIndex } from '@/routes/admin/users';
import { index as mentoringIndex } from '@/routes/mentoring';
import { complete as completeTour } from '@/routes/tours';
import type { UserRole } from '@/types';
import { RoleSwitcher } from './role-switcher';
import { DashboardClock } from './dashboard-clock';
import { ProductTour } from './product-tour';

/** A sidebar entry: with `href` it navigates (prefetched on hover), otherwise it calls `onSelect`. */
export type NavItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
    href?: string;
};

type SidebarProps = {
    nav: NavItem[];
    accountNav: NavItem[];
    active: string;
    onSelect?: (key: string) => void;
    footer?: ReactNode;
};

function useClickOutside(onOutside: () => void) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handle = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onOutside();
            }
        };

        document.addEventListener('mousedown', handle);

        return () => document.removeEventListener('mousedown', handle);
    }, [onOutside]);

    return ref;
}

/** Talent Passport progress card shown at the bottom of the participant sidebar. */
export function ProfileSidebarCard() {
    const currentUser = useCurrentUser();

    return (
        <div className="rounded-2xl border border-black/5 bg-white p-4">
            <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium">Talent Passport</span>
                <span className="text-black/45">
                    {currentUser.profileCompletion}%
                </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
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

function SidebarContent({
    nav,
    accountNav,
    active,
    onSelect,
    footer,
}: SidebarProps) {
    const item = ({ key, label, icon: Icon, badge, href }: NavItem) => {
        const className = cn(
            'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors',
            active === key
                ? 'font-medium text-ink'
                : 'text-black/55 hover:bg-black/[0.03] hover:text-ink',
        );
        const content = (
            <>
                {active === key && (
                    <motion.span
                        layoutId="sidebar-active"
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 34,
                        }}
                        className="absolute inset-0 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
                    />
                )}
                <Icon
                    className={cn(
                        'relative size-[18px]',
                        active === key && 'text-brand',
                    )}
                />
                <span className="relative">{label}</span>
                {badge !== undefined && badge > 0 && (
                    <span className="relative ml-auto rounded-full bg-cta px-1.5 py-px text-[10px] font-semibold text-white">
                        {badge}
                    </span>
                )}
            </>
        );

        return (
            <li key={key} data-tour={`nav-${key}`}>
                {href ? (
                    <Link
                        href={href}
                        prefetch
                        onClick={() => onSelect?.(key)}
                        className={className}
                    >
                        {content}
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={() => onSelect?.(key)}
                        className={className}
                    >
                        {content}
                    </button>
                )}
            </li>
        );
    };

    return (
        <div className="flex h-full flex-col">
            <Link
                href={home()}
                className="flex items-center gap-1.5 px-3 text-[15px] font-bold tracking-tight"
            >
                <LogoMark className="size-5 text-brand" />
                {brand.name}
            </Link>

            <p className="mt-8 mb-2 px-3 text-[11px] font-medium tracking-wide text-black/35 uppercase">
                Menu
            </p>
            <ul className="space-y-0.5">{nav.map(item)}</ul>

            <p className="mt-6 mb-2 px-3 text-[11px] font-medium tracking-wide text-black/35 uppercase">
                Akun
            </p>
            <ul className="space-y-0.5">{accountNav.map(item)}</ul>

            {footer && <div className="mt-auto">{footer}</div>}
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
                            <span className="text-[13px] font-semibold">
                                Notifikasi
                            </span>
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
                                            'mt-1.5 size-2 shrink-0 rounded-full',
                                            'bg-brand',
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
                                            {new Date(
                                                n.time,
                                            ).toLocaleDateString('id-ID')}
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
                    <span className="block text-[12.5px] font-medium">
                        {currentUser.name}
                    </span>
                    <span className="block text-[11px] text-black/45">
                        {currentUser.role}
                    </span>
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
                            <p className="text-[13px] font-medium">
                                {currentUser.name}
                            </p>
                            <p className="text-[11px] text-black/45">
                                {currentUser.email}
                            </p>
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
    children,
    onSelect,
    tour,
    ...sidebar
}: SidebarProps & {
    searchPlaceholder: string;
    children: ReactNode;
    /** The role whose guided tour this dashboard offers; it starts by itself until finished or skipped once. */
    tour?: UserRole;
}) {
    const [drawer, setDrawer] = useState(false);
    const [touring, setTouring] = useState(false);
    const page = usePage();
    const seen =
        !tour || (page.props.auth.user?.completed_tours ?? []).includes(tour);

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
                { preserveScroll: true, preserveState: true, only: ['auth'] },
            );
        }
    }, [seen, tour]);
    const pageUrl = page.url.split('?')[0];
    const organization = new URLSearchParams(page.url.split('?')[1]).get(
        'organization',
    );
    const search = (query: string) => {
        if (pageUrl === mentorDashboard.url())
            router.get(mentorDashboard.url(), {
                q: query,
                section: 'requests',
            });
        else if (pageUrl === partnerDashboard.url())
            router.get(partnerDashboard.url(), {
                q: query,
                section: 'programs',
                organization,
            });
        else if (pageUrl === companyDashboard.url())
            router.get(companyDashboard.url(), {
                q: query,
                section: 'jobs',
                organization,
            });
        else if (pageUrl === mentoringIndex.url())
            router.get(mentoringIndex.url(), { q: query });
        else if (pageUrl.startsWith(applicationsIndex.url()))
            router.get(applicationsIndex.url(), { q: query });
        else if (
            pageUrl.startsWith(
                usersIndex.url().split('/').slice(0, 2).join('/'),
            )
        )
            router.get(usersIndex.url(), { q: query });
        else
            router.get(
                catalogIndex.url(
                    pageUrl === catalogIndex.url('kelas')
                        ? 'kelas'
                        : pageUrl === catalogIndex.url('lowongan')
                          ? 'lowongan'
                          : 'beasiswa',
                ),
                { q: query },
            );
    };

    const select = (key: string) => {
        onSelect?.(key);
        setDrawer(false);
    };

    return (
        <div className="min-h-screen bg-surface font-sans text-ink antialiased">
            <aside className="fixed inset-y-0 left-0 hidden w-64 p-4 lg:block">
                <SidebarContent {...sidebar} onSelect={select} />
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
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{
                                type: 'spring',
                                stiffness: 320,
                                damping: 34,
                            }}
                            className="fixed inset-y-0 left-0 z-50 w-72 bg-surface p-4 shadow-2xl lg:hidden"
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

            <div className="lg:pl-64">
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
                        <form
                            role="search"
                            data-tour="search"
                            onSubmit={(event) => {
                                event.preventDefault();
                                search(
                                    String(
                                        new FormData(event.currentTarget).get(
                                            'q',
                                        ) ?? '',
                                    ).trim(),
                                );
                            }}
                            className="hidden h-10 max-w-sm min-w-0 flex-1 items-center gap-2 rounded-xl border border-black/5 bg-white px-3 text-black/40 focus-within:border-brand/40 sm:flex"
                        >
                            <SearchIcon className="size-4 shrink-0" />
                            <input
                                name="q"
                                aria-label={searchPlaceholder}
                                placeholder={searchPlaceholder}
                                className="w-full min-w-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-black/35"
                            />
                            <kbd className="rounded-md border border-black/10 px-1.5 text-[10px]">
                                /
                            </kbd>
                        </form>
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
                                    <span className="hidden sm:inline">
                                        Panduan
                                    </span>
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

            {touring && tour && (
                <ProductTour steps={tours[tour]} onClose={closeTour} />
            )}
        </div>
    );
}
