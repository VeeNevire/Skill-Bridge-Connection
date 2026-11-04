import { Head, Link } from '@inertiajs/react';
import { ParticipantLayout } from '@/components/dashboard/participant-layout';
import { Pagination } from '@/components/admin/ui';
import { index as catalog } from '@/routes/catalog';
import { show } from '@/routes/learning';
import type { Paginated } from '@/types';
export default function Learning({
    courses,
}: {
    courses: Paginated<{ id: number; title: string; summary: string | null }>;
}) {
    return (
        <ParticipantLayout active="academy">
            <Head title="Belajar" />
            <div className="mx-auto max-w-4xl space-y-5">
                <div className="flex flex-wrap justify-between gap-3">
                    <h1 className="text-2xl font-semibold">Kelas saya</h1>
                    <Link
                        href={catalog('kelas')}
                        className="rounded-xl bg-ink px-4 py-2 text-sm text-white"
                    >
                        Cari kelas
                    </Link>
                </div>
                {courses.data.map((course) => (
                    <article
                        key={course.id}
                        className="rounded-2xl bg-white p-5"
                    >
                        <Link
                            href={show(course.id)}
                            className="font-semibold text-brand"
                        >
                            {course.title}
                        </Link>
                        <p className="mt-2 text-sm text-black/60">
                            {course.summary}
                        </p>
                    </article>
                ))}
                {!courses.data.length && (
                    <p className="rounded-2xl bg-white p-8 text-sm text-black/50">
                        Belum mengikuti kelas. Buka katalog kelas untuk mulai
                        belajar.
                    </p>
                )}
                <Pagination paginator={courses} only={['courses']} />
            </div>
        </ParticipantLayout>
    );
}
