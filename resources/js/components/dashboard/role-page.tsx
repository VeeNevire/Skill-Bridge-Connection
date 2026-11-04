import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { easeOut } from '@/components/landing/blur-text';
import { cn } from '@/lib/utils';
import { DashboardLayout } from './dashboard-layout';
import type { NavItem } from './dashboard-layout';
import { Panel } from './panel';
import { ComingSoon, CountUp } from './widgets';

export type Kpi = { label: string; value: number; note: string; icon: LucideIcon; tone: string; suffix?: string };

export const kpiTones = {
    brand: 'bg-brand/10 text-brand',
    sky: 'bg-sky-500/10 text-sky-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
    red: 'bg-cta/10 text-cta',
};

export function KpiCards({ items }: { items: Kpi[] }) {
    return (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {items.map((kpi, i) => (
                <Panel key={kpi.label} index={i} className="p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] text-black/50">{kpi.label}</span>
                        <span className={cn('flex size-8 items-center justify-center rounded-lg', kpi.tone)}>
                            <kpi.icon className="size-4" />
                        </span>
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight">
                        <CountUp to={kpi.value} />
                        {kpi.suffix && <span className="text-lg text-black/40">{kpi.suffix}</span>}
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-black/45">{kpi.note}</p>
                </Panel>
            ))}
        </div>
    );
}

/**
 * Shell for a role dashboard: sidebar navigation where only the overview is built yet,
 * other menus show "sedang disiapkan" until their features exist.
 */
export function RolePage({
    title,
    nav,
    accountNav,
    footer,
    searchPlaceholder,
    children,
}: {
    title: string;
    nav: NavItem[];
    accountNav: NavItem[];
    footer?: ReactNode;
    searchPlaceholder: string;
    children: ReactNode;
}) {
    const [active, setActive] = useState('overview');
    const label = [...nav, ...accountNav].find((n) => n.key === active)?.label ?? '';

    return (
        <MotionConfig reducedMotion="user">
            <Head title={title} />
            <DashboardLayout nav={nav} accountNav={accountNav} active={active} onSelect={setActive} footer={footer} searchPlaceholder={searchPlaceholder}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: easeOut }}
                    >
                        {active === 'overview' ? children : <ComingSoon label={label} />}
                    </motion.div>
                </AnimatePresence>
            </DashboardLayout>
        </MotionConfig>
    );
}
