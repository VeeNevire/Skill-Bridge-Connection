import { useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Pagination } from '@/components/admin/ui';
import { download, destroy, store } from '@/routes/documents';
import type { Paginated } from '@/types';
export type PrivateDocument = {
    id: number;
    title: string;
    kind: string;
    original_name: string;
};
export function PrivateDocuments({
    documents,
    applicationId,
}: {
    documents: Paginated<PrivateDocument>;
    applicationId?: number;
}) {
    const fileInput = useRef<HTMLInputElement>(null);
    const form = useForm({
        title: '',
        kind: applicationId ? 'dokumen' : 'cv',
        application_id: applicationId ?? '',
        file: null as File | null,
    });
    const input =
        'mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm';
    return (
        <section className="space-y-4 rounded-2xl border border-black/5 bg-white p-5">
            <h2 className="text-lg font-semibold">Dokumen privat</h2>
            <p className="text-sm text-black/50">
                Dokumen ini hanya dapat diakses oleh akun Anda.
            </p>
            {documents.data.map((document) => (
                <div
                    key={document.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                    <a
                        className="text-brand hover:underline"
                        href={download.url(document.id)}
                    >
                        {document.title} · {document.kind}
                    </a>
                    <button
                        type="button"
                        className="text-cta"
                        onClick={() => {
                            if (window.confirm('Hapus dokumen ini?'))
                                router.delete(destroy.url(document.id), {
                                    preserveScroll: true,
                                });
                        }}
                    >
                        Hapus
                    </button>
                </div>
            ))}
            <Pagination paginator={documents} only={['documents']} />
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.submit(store(), {
                        preserveScroll: true,
                        forceFormData: true,
                        onSuccess: () => {
                            form.reset();
                            if (fileInput.current) fileInput.current.value = '';
                        },
                    });
                }}
                className="space-y-3 border-t border-black/5 pt-4"
            >
                <label className="block text-sm">
                    Judul dokumen
                    <input
                        className={input}
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                    />
                </label>
                <label className="block text-sm">
                    Jenis
                    <select
                        className={input}
                        value={form.data.kind}
                        onChange={(e) => form.setData('kind', e.target.value)}
                    >
                        <option value="cv">CV</option>
                        <option value="sertifikat">
                            Sertifikat atau pelatihan
                        </option>
                        <option value="dokumen">Dokumen lainnya</option>
                    </select>
                </label>
                <label className="block text-sm">
                    Berkas PDF, DOC, atau DOCX (maksimal 5 MB)
                    <input
                        ref={fileInput}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className={input}
                        onChange={(e) =>
                            form.setData('file', e.target.files?.[0] ?? null)
                        }
                    />
                </label>
                {Object.entries(form.errors).map(([key, error]) => (
                    <p key={key} role="alert" className="text-xs text-cta">
                        {error}
                    </p>
                ))}
                <button
                    disabled={form.processing}
                    className="rounded-xl bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                    {form.processing ? 'Mengunggah…' : 'Unggah dokumen'}
                </button>
            </form>
        </section>
    );
}
