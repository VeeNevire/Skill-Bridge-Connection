import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { EmptyState, Modal, PageHeader } from '@/components/admin/ui';
import { Panel } from '@/components/dashboard/panel';
import admin from '@/routes/admin';
import type { CategoryRow } from '@/types';

type Props = { categories: CategoryRow[] };

function CategoryForm({ category, onDone }: { category?: CategoryRow; onDone: () => void }) {
    const form = useForm({ name: category?.name ?? '', description: category?.description ?? '' });
    // The slug is derived from the name server-side, so its uniqueness error belongs to the name field.
    const errors = form.errors as Partial<Record<'name' | 'slug', string>>;
    const nameError = errors.name ?? errors.slug;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => (form.reset(), onDone()) };

        if (category) {
            form.patch(admin.categories.update.url(category.id), options);
        } else {
            form.post(admin.categories.store.url(), options);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <label className="block text-[12.5px] font-medium text-black/70">
                Nama kategori
                <input
                    autoFocus
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    maxLength={80}
                    className="mt-1.5 h-10 w-full rounded-xl border border-black/10 px-3 text-[13.5px] font-normal outline-none focus:border-brand"
                />
                {nameError && <span className="mt-1 block text-[11.5px] font-normal text-cta">{nameError}</span>}
            </label>
            <label className="block text-[12.5px] font-medium text-black/70">
                Deskripsi (opsional)
                <textarea
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                    rows={2}
                    maxLength={255}
                    className="mt-1.5 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-[13.5px] font-normal outline-none focus:border-brand"
                />
            </label>
            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onDone} className="rounded-lg px-3.5 py-2 text-[13px] text-black/60 hover:bg-zinc-100">
                    Batal
                </button>
                <button type="submit" disabled={form.processing} className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-white disabled:opacity-60">
                    {category ? 'Simpan perubahan' : 'Tambah kategori'}
                </button>
            </div>
        </form>
    );
}

export default function CategoriesIndex({ categories }: Props) {
    const [editing, setEditing] = useState<CategoryRow | 'new' | null>(null);
    const [deleting, setDeleting] = useState<CategoryRow | null>(null);

    return (
        <>
            <Head title="Kategori" />
            <PageHeader
                title="Kategori"
                subtitle="Kelompokkan beasiswa, kelas, dan lowongan agar mudah dicari."
                actions={
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setEditing('new')}
                        className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-[13px] font-medium text-white"
                    >
                        <Plus className="size-4" /> Tambah kategori
                    </motion.button>
                }
            />

            {categories.length === 0 ? (
                <Panel>
                    <EmptyState icon={Tags} title="Belum ada kategori" text="Tambahkan kategori pertama untuk mulai mengelompokkan konten." />
                </Panel>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence initial={false}>
                        {categories.map((category, i) => (
                            <motion.div
                                key={category.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.03 } }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4"
                            >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                    <Tags className="size-4.5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{category.name}</p>
                                    <p className="truncate text-[11.5px] text-black/40">/{category.slug}</p>
                                    <p className="mt-1.5 text-[12px] text-black/55">{category.opportunities_count} konten</p>
                                </div>
                                <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                                    <button
                                        type="button"
                                        aria-label={`Ubah ${category.name}`}
                                        onClick={() => setEditing(category)}
                                        className="flex size-8 items-center justify-center rounded-lg text-black/45 hover:bg-zinc-100 hover:text-ink"
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Hapus ${category.name}`}
                                        onClick={() => setDeleting(category)}
                                        className="flex size-8 items-center justify-center rounded-lg text-black/45 hover:bg-cta/5 hover:text-cta"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Tambah kategori' : 'Ubah kategori'}>
                {editing !== null && <CategoryForm key={editing === 'new' ? 'new' : editing.id} category={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />}
            </Modal>

            <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Hapus kategori">
                {deleting && (
                    <>
                        <p className="text-[13px] text-black/65">
                            Hapus kategori <span className="font-medium text-ink">{deleting.name}</span>?
                            {deleting.opportunities_count > 0 && ` ${deleting.opportunities_count} konten di dalamnya tetap ada, hanya tidak berkategori.`}
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button type="button" onClick={() => setDeleting(null)} className="rounded-lg px-3.5 py-2 text-[13px] text-black/60 hover:bg-zinc-100">
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => router.delete(admin.categories.destroy.url(deleting.id), { preserveScroll: true, onSuccess: () => setDeleting(null) })}
                                className="rounded-lg bg-cta px-3.5 py-2 text-[13px] font-medium text-white"
                            >
                                Hapus
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
}

CategoriesIndex.layout = AdminLayout;
