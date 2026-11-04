import { Link, usePage } from '@inertiajs/react';
import { BriefcaseBusiness, Building2, ChevronDown, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { easeOut } from '@/components/landing/blur-text';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import company from '@/routes/company';
import mentor from '@/routes/mentor';
import partner from '@/routes/partner';
import type { UserRole } from '@/types';

const views: Record<UserRole, { href: string; icon: LucideIcon }> = {
    admin: { href: admin.dashboard.url(), icon: ShieldCheck },
    peserta: { href: dashboard.url(), icon: GraduationCap },
    mentor: { href: mentor.dashboard.url(), icon: Users },
    mitra: { href: partner.dashboard.url(), icon: Building2 },
    perusahaan: { href: company.dashboard.url(), icon: BriefcaseBusiness },
};

/**
 * Switch between the dashboards of every role the account holds (blueprint §20).
 * Hidden for single-role accounts.
 */
export function RoleSwitcher() {
    const { url, props } = usePage();
    const roles = props.auth.user?.roles ?? [];
    const [open, setOpen] = useState(false);

    if (roles.length < 2) {
        return null;
    }

    const path = url.split('?')[0];
    const current =
        roles
            .filter((r) => path === views[r.name].href || path.startsWith(`${views[r.name].href}/`))
            .sort((a, b) => views[b.name].href.length - views[a.name].href.length)[0] ?? roles[0];
    const CurrentIcon = views[current.name].icon;

    return (
        <div className="relative" data-tour="role-switcher" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex h-10 items-center gap-2 rounded-xl border border-black/5 bg-white px-3 text-[12.5px] transition-colors hover:bg-zinc-50"
            >
                <CurrentIcon className="size-4 text-brand" />
                <span className="hidden sm:inline">
                    Tampilan: <span className="font-medium">{current.label}</span>
                </span>
                <ChevronDown className={cn('size-3.5 text-black/40 transition-transform', open && 'rotate-180')} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: easeOut }}
                        className="absolute right-0 z-40 mt-2 w-60 origin-top-right rounded-2xl border border-black/5 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]"
                    >
                        <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-black/40 uppercase">Ganti tampilan</p>
                        {roles.map((role) => {
                            const view = views[role.name];

                            return (
                                <Link
                                    key={role.id}
                                    href={view.href}
                                    prefetch
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-colors',
                                        role.id === current.id ? 'bg-brand/[0.06] font-medium text-brand-dark' : 'hover:bg-zinc-50',
                                    )}
                                >
                                    <view.icon className="size-4" />
                                    {role.label}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
