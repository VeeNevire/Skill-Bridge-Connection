import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    feedback,
    update,
    availability,
    profile as submitProfile,
} from '@/routes/mentoring';
import { update as updateProfile } from '@/routes/mentoring/profile';

export type Session = {
    id: number;
    topic: string;
    goal: string;
    status: string;
    starts_at: string;
    shared_note: string | null;
    private_note?: string | null;
    rating: number | null;
    feedback: string | null;
    mentor?: { name: string };
    participant?: { name: string };
};
export const fieldClass =
    'mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand outline-none';
const buttonClass =
    'rounded-xl bg-ink px-4 py-2 text-sm text-white disabled:opacity-50';
export function Errors({ errors }: { errors: Record<string, string> }) {
    return (
        <>
            {Object.entries(errors).map(([key, value]) => (
                <p key={key} role="alert" className="text-xs text-cta">
                    {value}
                </p>
            ))}
        </>
    );
}
export function SessionCard({
    session,
    mentor = false,
}: {
    session: Session;
    mentor?: boolean;
}) {
    const form = useForm({
        status: session.status,
        shared_note: session.shared_note ?? '',
        private_note: session.private_note ?? '',
    });
    const review = useForm({
        rating: session.rating ?? 5,
        feedback: session.feedback ?? '',
    });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.submit(update(session.id), { preserveScroll: true });
    };
    return (
        <article className="space-y-3 rounded-2xl border border-black/5 bg-white p-5">
            <div>
                <h2 className="font-semibold">{session.topic}</h2>
                <p className="mt-1 text-sm text-black/50">
                    {session.participant?.name ?? session.mentor?.name} ·{' '}
                    {new Date(session.starts_at).toLocaleString('id-ID')} ·{' '}
                    {session.status}
                </p>
            </div>
            <p className="text-sm text-black/65">{session.goal}</p>
            {mentor && session.status !== 'ditolak' ? (
                <form onSubmit={submit} className="space-y-3">
                    <label className="block text-sm">
                        Status
                        <select
                            className={fieldClass}
                            value={form.data.status}
                            onChange={(e) =>
                                form.setData('status', e.target.value)
                            }
                        >
                            {(session.status === 'menunggu'
                                ? ['menunggu', 'diterima', 'ditolak']
                                : session.status === 'selesai'
                                  ? ['selesai']
                                  : ['diterima', 'selesai']
                            ).map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm">
                        Catatan untuk peserta
                        <textarea
                            className={fieldClass}
                            value={form.data.shared_note}
                            onChange={(e) =>
                                form.setData('shared_note', e.target.value)
                            }
                        />
                    </label>
                    <label className="block text-sm">
                        Catatan pribadi mentor
                        <textarea
                            className={fieldClass}
                            value={form.data.private_note}
                            onChange={(e) =>
                                form.setData('private_note', e.target.value)
                            }
                        />
                    </label>
                    <Errors errors={form.errors} />
                    <button disabled={form.processing} className={buttonClass}>
                        Simpan sesi
                    </button>
                </form>
            ) : (
                session.shared_note && (
                    <div className="rounded-xl bg-brand/5 p-3 text-sm">
                        <p className="font-medium">Catatan mentor</p>
                        <p className="mt-1 whitespace-pre-wrap">
                            {session.shared_note}
                        </p>
                    </div>
                )
            )}
            {session.rating && (
                <p className="text-sm">
                    Penilaian: {session.rating}/5 · {session.feedback}
                </p>
            )}
            {!mentor && session.status === 'selesai' && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        review.submit(feedback(session.id), {
                            preserveScroll: true,
                        });
                    }}
                    className="space-y-2"
                >
                    <label className="block text-sm">
                        Penilaian
                        <select
                            className={fieldClass}
                            value={review.data.rating}
                            onChange={(e) =>
                                review.setData('rating', Number(e.target.value))
                            }
                        >
                            {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>
                                    {n}/5
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm">
                        Umpan balik
                        <textarea
                            className={fieldClass}
                            value={review.data.feedback}
                            onChange={(e) =>
                                review.setData('feedback', e.target.value)
                            }
                        />
                    </label>
                    <Errors errors={review.errors} />
                    <button
                        disabled={review.processing}
                        className={buttonClass}
                    >
                        Kirim umpan balik
                    </button>
                </form>
            )}
        </article>
    );
}
export function AvailabilityForm() {
    const form = useForm({ starts_at: '', duration: 60 });
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.transform((data) => ({
                    ...data,
                    starts_at: data.starts_at
                        ? new Date(data.starts_at).toISOString()
                        : '',
                }));
                form.submit(availability(), {
                    preserveScroll: true,
                    onSuccess: () => form.reset(),
                });
            }}
            className="space-y-3 rounded-2xl bg-white p-5"
        >
            <h2 className="font-semibold">Tambah jadwal tersedia</h2>
            <label className="block text-sm">
                Tanggal dan waktu
                <input
                    type="datetime-local"
                    className={fieldClass}
                    value={form.data.starts_at}
                    onChange={(e) => form.setData('starts_at', e.target.value)}
                />
            </label>
            <label className="block text-sm">
                Durasi
                <select
                    className={fieldClass}
                    value={form.data.duration}
                    onChange={(e) =>
                        form.setData('duration', Number(e.target.value))
                    }
                >
                    {[30, 60, 90].map((n) => (
                        <option key={n} value={n}>
                            {n} menit
                        </option>
                    ))}
                </select>
            </label>
            <Errors errors={form.errors} />
            <button disabled={form.processing} className={buttonClass}>
                Tambah jadwal
            </button>
        </form>
    );
}
export function MentorProfileForm({
    profile,
    verified = false,
}: {
    profile?: {
        expertise: string;
        bio: string | null;
        years_experience: number;
        status: string;
    } | null;
    verified?: boolean;
}) {
    const form = useForm({
        expertise: profile?.expertise ?? '',
        bio: profile?.bio ?? '',
        years_experience: profile?.years_experience ?? 0,
    });
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.submit(verified ? updateProfile() : submitProfile(), {
                    preserveScroll: true,
                });
            }}
            className="space-y-3 rounded-2xl bg-white p-5"
        >
            <h2 className="font-semibold">
                {verified ? 'Profil mentor' : 'Ajukan diri sebagai mentor'}
            </h2>
            <p className="text-sm text-black/50">
                {profile
                    ? `Status: ${profile.status}`
                    : 'Profil akan ditinjau admin sebelum tampil di direktori.'}
            </p>
            <label className="block text-sm">
                Bidang keahlian
                <input
                    className={fieldClass}
                    value={form.data.expertise}
                    onChange={(e) => form.setData('expertise', e.target.value)}
                />
            </label>
            <label className="block text-sm">
                Pengalaman (tahun)
                <input
                    type="number"
                    className={fieldClass}
                    value={form.data.years_experience}
                    onChange={(e) =>
                        form.setData('years_experience', Number(e.target.value))
                    }
                />
            </label>
            <label className="block text-sm">
                Tentang mentor
                <textarea
                    className={fieldClass}
                    value={form.data.bio}
                    onChange={(e) => form.setData('bio', e.target.value)}
                />
            </label>
            <Errors errors={form.errors} />
            <button disabled={form.processing} className={buttonClass}>
                Simpan profil mentor
            </button>
        </form>
    );
}
