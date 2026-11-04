import { Head, router, useForm } from '@inertiajs/react';
import { FlashToast, Pagination } from '@/components/admin/ui';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import {
    Errors,
    fieldClass,
    MentorProfileForm,
    SessionCard,
} from '@/components/dashboard/mentoring-ui';
import type { Session } from '@/components/dashboard/mentoring-ui';
import { navItems, accountNavItems } from '@/data/dashboard';
import { dashboard } from '@/routes';
import { store } from '@/routes/mentoring';
import type { Paginated } from '@/types';

type Slot = {
    id: number;
    mentor_id: number;
    starts_at: string;
    duration: number;
};
type Mentor = {
    id: number;
    user_id: number;
    expertise: string;
    bio: string | null;
    user: { name: string };
};
function MentorCard({ mentor, slots }: { mentor: Mentor; slots: Slot[] }) {
    const form = useForm({ availability_id: '', topic: '', goal: '' });
    return (
        <article className="space-y-3 rounded-2xl bg-white p-5">
            <h2 className="font-semibold">{mentor.user.name}</h2>
            <p className="text-sm text-brand">{mentor.expertise}</p>
            <p className="text-sm text-black/60">{mentor.bio}</p>
            {slots.length ? (
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.submit(store(), {
                            preserveScroll: true,
                            onSuccess: () => form.reset(),
                        });
                    }}
                >
                    <label className="block text-sm">
                        Pilih jadwal
                        <select
                            className={fieldClass}
                            value={form.data.availability_id}
                            onChange={(e) =>
                                form.setData('availability_id', e.target.value)
                            }
                        >
                            <option value="">Pilih jadwal tersedia</option>
                            {slots.map((slot) => (
                                <option key={slot.id} value={slot.id}>
                                    {new Date(slot.starts_at).toLocaleString(
                                        'id-ID',
                                    )}{' '}
                                    · {slot.duration} menit
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm">
                        Topik
                        <input
                            className={fieldClass}
                            value={form.data.topic}
                            onChange={(e) =>
                                form.setData('topic', e.target.value)
                            }
                        />
                    </label>
                    <label className="block text-sm">
                        Tujuan konsultasi
                        <textarea
                            className={fieldClass}
                            value={form.data.goal}
                            onChange={(e) =>
                                form.setData('goal', e.target.value)
                            }
                        />
                    </label>
                    <Errors errors={form.errors} />
                    <button
                        disabled={form.processing}
                        className="rounded-xl bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                        Minta sesi
                    </button>
                </form>
            ) : (
                <p className="text-sm text-black/45">
                    Belum ada jadwal tersedia.
                </p>
            )}
        </article>
    );
}
export default function Mentoring({
    mentors,
    slots,
    sessions,
    myProfile,
}: {
    mentors: Paginated<Mentor>;
    slots: Slot[];
    sessions: Paginated<Session>;
    myProfile: {
        expertise: string;
        bio: string | null;
        years_experience: number;
        status: string;
    } | null;
}) {
    return (
        <DashboardLayout
            nav={navItems}
            accountNav={accountNavItems}
            active="mentor"
            onSelect={(key) => {
                if (
                    ![...navItems, ...accountNavItems].find(
                        (item) => item.key === key,
                    )?.href
                )
                    router.get(dashboard.url({ query: { menu: key } }));
            }}
            searchPlaceholder="Cari beasiswa, kelas, mentor…"
        >
            <Head title="Mentor" />
            <FlashToast />
            <div className="mx-auto max-w-4xl space-y-5">
                <h1 className="text-2xl font-semibold">Mentor</h1>
                <p className="text-sm text-black/50">
                    Pilih mentor dan ajukan sesi sesuai jadwal yang tersedia.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    {mentors.data.map((mentor) => (
                        <MentorCard
                            key={mentor.id}
                            mentor={mentor}
                            slots={slots.filter(
                                (slot) => slot.mentor_id === mentor.user_id,
                            )}
                        />
                    ))}
                </div>
                {!mentors.data.length && (
                    <p className="rounded-2xl bg-white p-5 text-sm">
                        Belum ada mentor terverifikasi.
                    </p>
                )}
                <Pagination paginator={mentors} only={['mentors', 'slots']} />
                <h2 className="text-xl font-semibold">Sesi saya</h2>
                {sessions.data.map((session) => (
                    <SessionCard
                        key={session.id + session.status}
                        session={session}
                    />
                ))}
                {!sessions.data.length && (
                    <p className="text-sm text-black/50">
                        Belum ada permintaan sesi.
                    </p>
                )}
                <Pagination paginator={sessions} only={['sessions']} />
                <MentorProfileForm profile={myProfile} />
            </div>
        </DashboardLayout>
    );
}
