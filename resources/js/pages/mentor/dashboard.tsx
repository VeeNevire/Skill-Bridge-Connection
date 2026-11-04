import { Head, router } from '@inertiajs/react';
import { FlashToast, Pagination } from '@/components/admin/ui';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import {
    AvailabilityForm,
    MentorProfileForm,
    SessionCard,
} from '@/components/dashboard/mentoring-ui';
import type { Session } from '@/components/dashboard/mentoring-ui';
import { mentorNav, mentorAccountNav } from '@/data/mentor';
import { dashboard } from '@/routes/mentor';
import { removeAvailability } from '@/routes/mentoring';
import type { Paginated } from '@/types';

export default function MentorDashboard({
    sessions,
    slots,
    profile,
    section = 'overview',
}: {
    sessions: Paginated<Session>;
    slots: Paginated<{
        id: number;
        starts_at: string;
        duration: number;
        reservations: number;
    }>;
    profile: {
        expertise: string;
        bio: string | null;
        years_experience: number;
        status: string;
    } | null;
    section?: string;
}) {
    const label =
        [...mentorNav, ...mentorAccountNav].find((item) => item.key === section)
            ?.label ?? 'Ringkasan';
    return (
        <DashboardLayout
            nav={mentorNav.map((item) => ({ ...item, badge: undefined }))}
            accountNav={mentorAccountNav}
            active={section}
            tour="mentor"
            onSelect={(key) => {
                if (
                    ![...mentorNav, ...mentorAccountNav].find(
                        (item) => item.key === key,
                    )?.href
                )
                    router.get(dashboard.url({ query: { section: key } }));
            }}
            searchPlaceholder="Cari peserta dan sesi"
        >
            <Head title={label} />
            <FlashToast />
            <div className="mx-auto max-w-4xl space-y-4">
                <h1 className="text-2xl font-semibold">{label}</h1>
                {section === 'profile' ? (
                    <MentorProfileForm profile={profile} verified />
                ) : section === 'settings' ? (
                    <p className="rounded-2xl bg-white p-5 text-sm">
                        Pengaturan akun tersedia melalui menu akun.
                    </p>
                ) : (
                    <>
                        {section === 'overview' && (
                            <p className="text-sm text-black/50">
                                {sessions.total} sesi mentoring tercatat.
                                Gunakan menu untuk menjawab permintaan dan
                                mencatat hasil bimbingan.
                            </p>
                        )}
                        {section === 'schedule' && (
                            <>
                                <AvailabilityForm />
                                <div className="rounded-2xl bg-white p-5">
                                    <h2 className="font-semibold">
                                        Jadwal yang diterbitkan
                                    </h2>
                                    {slots.data.map((slot) => (
                                        <p
                                            className="mt-2 text-sm"
                                            key={slot.id}
                                        >
                                            {new Date(
                                                slot.starts_at,
                                            ).toLocaleString('id-ID')}{' '}
                                            · {slot.duration} menit
                                            {slot.reservations > 0 ? (
                                                <span className="ml-2 text-brand">
                                                    Dipesan
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="ml-3 text-xs text-cta"
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                'Hapus jadwal tersedia ini?',
                                                            )
                                                        )
                                                            router.delete(
                                                                removeAvailability.url(
                                                                    slot.id,
                                                                ),
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                    }}
                                                >
                                                    Hapus jadwal
                                                </button>
                                            )}
                                        </p>
                                    ))}
                                    <Pagination
                                        paginator={slots}
                                        only={['slots']}
                                    />
                                </div>
                            </>
                        )}
                        {sessions.data.length ? (
                            sessions.data.map((session) => (
                                <SessionCard
                                    key={session.id + session.status}
                                    session={session}
                                    mentor
                                />
                            ))
                        ) : (
                            <p className="rounded-2xl bg-white p-8 text-center text-sm text-black/50">
                                Belum ada sesi pada bagian ini.
                            </p>
                        )}
                        <Pagination paginator={sessions} only={['sessions']} />
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
