import type { ReactNode } from 'react';
import { DashboardLayout, ProfileSidebarCard } from './dashboard-layout';
import { FlashToast } from '@/components/admin/ui';
import { navItems, accountNavItems } from '@/data/dashboard';
export function ParticipantLayout({
    active,
    children,
}: {
    active: string;
    children: ReactNode;
}) {
    return (
        <DashboardLayout
            nav={navItems}
            accountNav={accountNavItems}
            active={active}
            tour="peserta"
            footer={<ProfileSidebarCard />}
            searchPlaceholder="Cari beasiswa, kelas, mentor…"
        >
            <FlashToast />
            {children}
        </DashboardLayout>
    );
}
