import { Head, Link } from '@inertiajs/react';
import { PrivateDocuments } from '@/components/dashboard/private-documents';
import type { PrivateDocument } from '@/components/dashboard/private-documents';
import type { Paginated } from '@/types';
import { TalentPassport } from '@/components/dashboard/talent-passport';
import type { Passport } from '@/components/dashboard/talent-passport';
import { ParticipantLayout } from '@/components/dashboard/participant-layout';
import { Greeting } from '@/components/dashboard/greeting';
import { index as applications } from '@/routes/applications';
import { index as mentoring } from '@/routes/mentoring';
import { show as opportunityShow } from '@/routes/catalog';
import { index as learning } from '@/routes/learning';
import { edit as passportEdit } from '@/routes/passport';
import { useCurrentUser } from '@/hooks/use-current-user';

type Overview = {
    recommendations: { id: number; title: string; summary: string | null }[];
    recommendationReason: string;
    applications: number;
    courses: number;
    sessions: number;
    recent: { id: number; status: string; opportunity: { title: string } }[];
    deadlines: { id: number; title: string; due_date: string }[];
    nextSession: {
        topic: string;
        starts_at: string;
        mentor: { name: string };
    } | null;
};
export default function Dashboard({
    initialTab = 'overview',
    passport,
    overview,
    documents,
}: {
    initialTab?: string;
    passport?: Passport;
    overview?: Overview;
    documents?: Paginated<PrivateDocument>;
}) {
    const user = useCurrentUser();
    return (
        <ParticipantLayout active={initialTab}>
            <Head
                title={
                    initialTab === 'passport' ? 'Talent Passport' : 'Dashboard'
                }
            />
            {initialTab === 'passport' && passport ? (
                <div className="mx-auto max-w-4xl space-y-5">
                    <TalentPassport passport={passport} />
                    {documents && <PrivateDocuments documents={documents} />}
                </div>
            ) : (
                overview && (
                    <>
                        <Greeting />
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                {
                                    label: 'Peluang tersimpan',
                                    value: overview.applications,
                                    href: applications.url(),
                                },
                                {
                                    label: 'Kelas diikuti',
                                    value: overview.courses,
                                    href: learning.url(),
                                },
                                {
                                    label: 'Sesi diterima',
                                    value: overview.sessions,
                                    href: mentoring.url(),
                                },
                                {
                                    label: 'Kelengkapan profil',
                                    value: `${user.profileCompletion}%`,
                                    href: passportEdit.url(),
                                },
                            ].map((item) => (
                                <Link
                                    href={item.href}
                                    key={item.label}
                                    className="rounded-2xl border border-black/5 bg-white p-5"
                                >
                                    <p className="text-sm text-black/50">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold">
                                        {item.value}
                                    </p>
                                </Link>
                            ))}
                        </div>
                        <section className="mt-5 rounded-2xl bg-white p-5">
                            <h2 className="font-semibold">
                                Peluang untuk Anda
                            </h2>
                            <p className="mt-1 text-xs text-black/45">
                                {overview.recommendationReason}
                            </p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {overview.recommendations.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={opportunityShow(item.id)}
                                        className="rounded-xl border border-black/5 p-3"
                                    >
                                        <p className="text-sm font-medium text-brand">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-xs text-black/50">
                                            {item.summary}
                                        </p>
                                    </Link>
                                ))}
                                {!overview.recommendations.length && (
                                    <p className="text-sm text-black/50">
                                        Belum ada peluang yang sesuai preferensi
                                        Anda.
                                    </p>
                                )}
                            </div>
                        </section>
                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            <section className="rounded-2xl bg-white p-5">
                                <Link
                                    href={applications()}
                                    className="font-semibold"
                                >
                                    Aplikasi terbaru
                                </Link>
                                <div className="mt-4 space-y-3">
                                    {overview.recent.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={applications()}
                                            className="block text-sm"
                                        >
                                            {item.opportunity.title}
                                            <span className="ml-2 text-black/45">
                                                {item.status.replaceAll(
                                                    '_',
                                                    ' ',
                                                )}
                                            </span>
                                        </Link>
                                    ))}
                                    {!overview.recent.length && (
                                        <p className="text-sm text-black/50">
                                            Simpan peluang dari katalog untuk
                                            mulai menyiapkan aplikasi.
                                        </p>
                                    )}
                                </div>
                            </section>
                            <section className="rounded-2xl bg-white p-5">
                                <h2 className="font-semibold">
                                    Tugas dan tenggat
                                </h2>
                                <div className="mt-4 space-y-3">
                                    {overview.deadlines.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={applications()}
                                            className="block text-sm"
                                        >
                                            {item.title} ·{' '}
                                            {new Date(
                                                item.due_date,
                                            ).toLocaleDateString('id-ID')}
                                        </Link>
                                    ))}
                                    {!overview.deadlines.length && (
                                        <p className="text-sm text-black/50">
                                            Belum ada tugas bertenggat.
                                        </p>
                                    )}
                                </div>
                            </section>
                            <section className="rounded-2xl bg-white p-5">
                                <Link
                                    href={mentoring()}
                                    className="font-semibold"
                                >
                                    Sesi mentor berikutnya
                                </Link>
                                <p className="mt-3 text-sm text-black/60">
                                    {overview.nextSession
                                        ? `${overview.nextSession.mentor.name} · ${overview.nextSession.topic} · ${new Date(overview.nextSession.starts_at).toLocaleString('id-ID')}`
                                        : 'Belum ada sesi terjadwal.'}
                                </p>
                            </section>
                        </div>
                    </>
                )
            )}
        </ParticipantLayout>
    );
}
