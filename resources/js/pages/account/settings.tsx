import { Head, usePage } from '@inertiajs/react';
import { FlashToast } from '@/components/admin/ui';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DataForm } from '@/components/dashboard/data-form';
import { OrganizationRegistration } from '@/components/dashboard/organization-portal';
import { navItems, accountNavItems } from '@/data/dashboard';
import { mentorNav, mentorAccountNav } from '@/data/mentor';
import { partnerNav, partnerAccountNav } from '@/data/partner';
import { companyNav, companyAccountNav } from '@/data/company';
import { dashboard as mentorDashboard } from '@/routes/mentor';
import { dashboard as partnerDashboard } from '@/routes/partner';
import { dashboard as companyDashboard } from '@/routes/company';
import { edit, update, password } from '@/routes/account';

export default function Settings() {
    const user = usePage().props.auth.user;
    const role = ['perusahaan', 'mitra', 'mentor'].find((role) =>
        user.roles.some((item) => item.name === role),
    );
    const source =
        role === 'perusahaan'
            ? [companyNav, companyAccountNav]
            : role === 'mitra'
              ? [partnerNav, partnerAccountNav]
              : [mentorNav, mentorAccountNav];
    const route =
        role === 'perusahaan'
            ? companyDashboard
            : role === 'mitra'
              ? partnerDashboard
              : mentorDashboard;
    const nav = role
        ? source[0].map((item) => ({
              ...item,
              badge: undefined,
              href: route.url({ query: { section: item.key } }),
          }))
        : navItems;
    const accountNav = role
        ? source[1].map((item) => ({
              ...item,
              href:
                  item.key === 'settings'
                      ? edit.url()
                      : route.url({ query: { section: item.key } }),
          }))
        : accountNavItems;
    return (
        <DashboardLayout
            nav={nav}
            accountNav={accountNav}
            active="settings"
            searchPlaceholder="Pengaturan akun"
        >
            <Head title="Pengaturan akun" />
            <FlashToast />
            <div className="mx-auto max-w-3xl space-y-5">
                <h1 className="text-2xl font-semibold">Pengaturan akun</h1>
                <DataForm
                    action={update()}
                    title="Informasi akun"
                    initial={{ name: user.name, email: user.email }}
                    fields={[
                        { key: 'name', label: 'Nama lengkap' },
                        { key: 'email', label: 'Email', type: 'email' },
                    ]}
                />
                <DataForm
                    action={password()}
                    title="Ubah kata sandi"
                    fields={[
                        {
                            key: 'current_password',
                            label: 'Kata sandi saat ini',
                            type: 'password',
                        },
                        {
                            key: 'password',
                            label: 'Kata sandi baru',
                            type: 'password',
                        },
                        {
                            key: 'password_confirmation',
                            label: 'Konfirmasi kata sandi baru',
                            type: 'password',
                        },
                    ]}
                />
                <OrganizationRegistration />
            </div>
        </DashboardLayout>
    );
}
