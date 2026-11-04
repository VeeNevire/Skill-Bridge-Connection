import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { FlashToast, Pagination } from '@/components/admin/ui';
import {
    DashboardLayout,
    ProfileSidebarCard,
} from '@/components/dashboard/dashboard-layout';
import { accountNavItems, navItems } from '@/data/dashboard';
import { destroy, update } from '@/routes/applications';
import {
    store as addTask,
    update as updateTask,
    destroy as deleteTask,
} from '@/routes/application-tasks';
import { dashboard } from '@/routes';
import { show as workspace } from '@/routes/workspace';
import type { Paginated } from '@/types';

type Task = {
    id: number;
    title: string;
    completed: boolean;
    due_date: string | null;
};
type Application = {
    id: number;
    status: string;
    notes: string | null;
    opportunity: {
        title: string;
        deadline: string | null;
        source_url: string | null;
    };
    tasks: Task[];
};
const statuses: Record<string, string> = {
    ingin_daftar: 'Ingin mendaftar',
    persiapan: 'Persiapan',
    dikirim: 'Dikirim',
    seleksi: 'Seleksi',
    diterima: 'Diterima',
    tidak_lolos: 'Tidak lolos',
};
const input =
    'w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-brand';
function ApplicationCard({ application }: { application: Application }) {
    const form = useForm({
        status: application.status,
        notes: application.notes ?? '',
    });
    const task = useForm({ title: '', due_date: '' });
    function submit(e: FormEvent) {
        e.preventDefault();
        form.submit(update(application.id), { preserveScroll: true });
    }
    function submitTask(e: FormEvent) {
        e.preventDefault();
        task.submit(addTask(application.id), {
            preserveScroll: true,
            onSuccess: () => task.reset(),
        });
    }
    return (
        <article className="space-y-4 rounded-2xl border border-black/5 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">
                        {application.opportunity.title}
                    </h2>
                    <p className="mt-1 text-xs text-black/45">
                        {application.opportunity.deadline
                            ? `Tenggat: ${new Date(application.opportunity.deadline).toLocaleDateString('id-ID')}`
                            : 'Tenggat belum dicantumkan'}
                    </p>
                </div>
                <button
                    type="button"
                    className="text-xs text-cta"
                    onClick={() => {
                        if (
                            window.confirm(
                                'Hapus peluang dan seluruh tugasnya dari pelacak?',
                            )
                        )
                            router.delete(destroy.url(application.id), {
                                preserveScroll: true,
                            });
                    }}
                >
                    Hapus
                </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
                <label className="block text-sm font-medium">
                    Status pribadi
                    <select
                        className={input + ' mt-1'}
                        value={form.data.status}
                        onChange={(e) => form.setData('status', e.target.value)}
                    >
                        {Object.entries(statuses).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block text-sm font-medium">
                    Catatan
                    <textarea
                        className={input + ' mt-1'}
                        rows={2}
                        value={form.data.notes}
                        onChange={(e) => form.setData('notes', e.target.value)}
                    />
                </label>
                {(form.errors.notes || form.errors.status) && (
                    <p role="alert" className="text-xs text-cta">
                        {form.errors.notes || form.errors.status}
                    </p>
                )}
                <button
                    disabled={form.processing}
                    className="rounded-lg bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                    Simpan catatan
                </button>
            </form>
            <Link
                href={workspace(application.id)}
                className="inline-block text-sm font-medium text-brand"
            >
                Buka dokumen dan draft aplikasi
            </Link>
            <div className="border-t border-black/5 pt-4">
                <h3 className="text-sm font-semibold">Checklist persiapan</h3>
                <ul className="mt-3 space-y-2">
                    {application.tasks.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-2 text-sm"
                        >
                            <input
                                aria-label={`Tandai ${item.title} selesai`}
                                type="checkbox"
                                checked={item.completed}
                                onChange={(e) =>
                                    router.patch(
                                        updateTask.url({
                                            application: application.id,
                                            task: item.id,
                                        }),
                                        { completed: e.target.checked },
                                        { preserveScroll: true },
                                    )
                                }
                            />
                            <span className="flex-1">
                                {item.title}
                                {item.due_date && (
                                    <span className="ml-2 text-xs text-black/45">
                                        {new Date(
                                            item.due_date,
                                        ).toLocaleDateString('id-ID')}
                                    </span>
                                )}
                            </span>
                            <button
                                type="button"
                                className="text-xs text-cta"
                                onClick={() =>
                                    router.delete(
                                        deleteTask.url({
                                            application: application.id,
                                            task: item.id,
                                        }),
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                Hapus
                            </button>
                        </li>
                    ))}
                </ul>
                <form
                    onSubmit={submitTask}
                    className="mt-3 flex flex-wrap gap-2"
                >
                    <input
                        aria-label="Nama tugas"
                        className={input + ' min-w-40 flex-1'}
                        placeholder="Tambah tugas atau dokumen"
                        value={task.data.title}
                        onChange={(e) => task.setData('title', e.target.value)}
                    />
                    <input
                        aria-label="Tenggat tugas"
                        type="date"
                        className={input + ' sm:w-auto'}
                        value={task.data.due_date}
                        onChange={(e) =>
                            task.setData('due_date', e.target.value)
                        }
                    />
                    <button
                        disabled={task.processing}
                        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm"
                    >
                        Tambah
                    </button>
                </form>
                {(task.errors.title || task.errors.due_date) && (
                    <p role="alert" className="mt-1 text-xs text-cta">
                        {task.errors.title || task.errors.due_date}
                    </p>
                )}
            </div>
            {application.opportunity.source_url &&
                /^https?:\/\//i.test(application.opportunity.source_url) && (
                    <a
                        className="inline-block text-sm font-medium text-brand"
                        href={application.opportunity.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Buka kanal resmi
                    </a>
                )}
        </article>
    );
}
export default function Applications({
    applications,
    submissions,
}: {
    applications: Paginated<Application>;
    submissions: Paginated<{
        id: number;
        title: string;
        stage: string;
        interview_at: string | null;
        interview_location: string | null;
    }>;
}) {
    return (
        <DashboardLayout
            nav={navItems}
            accountNav={accountNavItems}
            active="studio"
            onSelect={(key) => {
                if (
                    ![...navItems, ...accountNavItems].find(
                        (item) => item.key === key,
                    )?.href
                )
                    router.get(dashboard.url());
            }}
            footer={<ProfileSidebarCard />}
            searchPlaceholder="Cari beasiswa, kelas, mentor…"
        >
            <Head title="Application Studio" />
            <FlashToast />
            <div className="mx-auto max-w-4xl">
                <h1 className="text-2xl font-semibold">Application Studio</h1>
                <p className="mt-2 text-sm text-black/50">
                    Simpan peluang dan pantau persiapan Anda. Status ini adalah
                    catatan pribadi dan tidak dikirim ke penyelenggara.
                </p>
                <div className="mt-6 space-y-4">
                    {submissions.data.length > 0 && (
                        <section className="space-y-3 rounded-2xl bg-white p-5">
                            <h2 className="font-semibold">
                                Pendaftaran langsung ke organisasi
                            </h2>
                            {submissions.data.map((item) => (
                                <div key={item.id} className="text-sm">
                                    <p>
                                        {item.title} · {item.stage}
                                    </p>
                                    {item.interview_at && (
                                        <p className="mt-1 text-black/50">
                                            Wawancara:{' '}
                                            {new Date(
                                                item.interview_at,
                                            ).toLocaleString('id-ID')}{' '}
                                            · {item.interview_location}
                                        </p>
                                    )}
                                </div>
                            ))}
                            <Pagination
                                paginator={submissions}
                                only={['submissions']}
                            />
                        </section>
                    )}
                    {applications.data.length ? (
                        applications.data.map((application) => (
                            <ApplicationCard
                                key={application.id}
                                application={application}
                            />
                        ))
                    ) : (
                        <p className="rounded-2xl bg-white p-8 text-center text-sm text-black/50">
                            Belum ada peluang tersimpan. Cari peluang di katalog
                            untuk memulai.
                        </p>
                    )}
                </div>
                <Pagination paginator={applications} only={['applications']} />
            </div>
        </DashboardLayout>
    );
}
