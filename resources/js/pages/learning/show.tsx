import { Head, Link, router } from '@inertiajs/react';
import { ParticipantLayout } from '@/components/dashboard/participant-layout';
import { Pagination } from '@/components/admin/ui';
import { index, progress } from '@/routes/learning';
import type { Paginated } from '@/types';
export default function Course({
    course,
    lessons,
    completed,
}: {
    course: { id: number; title: string };
    lessons: Paginated<{
        id: number;
        title: string;
        source_url: string;
        description: string | null;
    }>;
    completed: number[];
}) {
    const percentage = lessons.total
        ? Math.round((completed.length / lessons.total) * 100)
        : 0;
    return (
        <ParticipantLayout active="academy">
            <Head title={course.title} />
            <div className="mx-auto max-w-4xl space-y-5">
                <Link href={index()} className="text-sm text-brand">
                    Kembali ke kelas saya
                </Link>
                <h1 className="text-2xl font-semibold">{course.title}</h1>
                <p className="text-sm text-black/50">
                    {completed.length}/{lessons.total} materi selesai ·{' '}
                    {percentage}%
                </p>
                {lessons.data.map((lesson) => (
                    <article
                        key={lesson.id}
                        className="space-y-3 rounded-2xl bg-white p-5"
                    >
                        <h2 className="font-semibold">{lesson.title}</h2>
                        <p className="text-sm whitespace-pre-wrap text-black/60">
                            {lesson.description}
                        </p>
                        {/^https?:\/\//i.test(lesson.source_url) && (
                            <a
                                href={lesson.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-sm text-brand"
                            >
                                Buka materi belajar
                            </a>
                        )}
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={completed.includes(lesson.id)}
                                onChange={(e) =>
                                    router.patch(
                                        progress.url({
                                            opportunity: course.id,
                                            lesson: lesson.id,
                                        }),
                                        { completed: e.target.checked },
                                        { preserveScroll: true },
                                    )
                                }
                            />
                            Saya sudah menyelesaikan materi ini
                        </label>
                    </article>
                ))}
                {!lessons.data.length && (
                    <p className="rounded-2xl bg-white p-5 text-sm text-black/50">
                        Penyelenggara belum menambahkan materi kelas.
                    </p>
                )}
                <Pagination
                    paginator={lessons}
                    only={['lessons', 'completed']}
                />
            </div>
        </ParticipantLayout>
    );
}
