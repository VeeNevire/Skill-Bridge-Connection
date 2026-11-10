import { Head, router, useForm } from '@inertiajs/react';
import { ExternalLink, Eye, Globe, Pencil, Play, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Badge, EmptyState, Modal, PageHeader, Pagination, SearchInput, formatDate, timeAgo, useFilters } from '@/components/admin/ui';
import { Panel } from '@/components/dashboard/panel';
import { xsrfToken } from '@/lib/utils';
import admin from '@/routes/admin';
import type { ManagedOpportunityRow, Paginated, ScrapeSourceRow } from '@/types';

type Type = ScrapeSourceRow['type'];
type Props = {
    type: Type;
    sources: ScrapeSourceRow[];
    opportunities: Paginated<ManagedOpportunityRow>;
    filters: { q?: string | null; per_page?: number | null };
    categories: { id: number; name: string }[];
};
type PreviewItem = { title: string; url: string; summary: string | null; deadline: string | null; organizer: string | null };

const typeLabels: Record<Type, string> = { beasiswa: 'Beasiswa', magang: 'Magang', lowongan: 'Karier' };
const inputClass = 'mt-1.5 h-10 w-full rounded-xl border border-black/10 px-3 text-[13.5px] font-normal outline-none focus:border-brand';
const iconButton = 'flex size-8 shrink-0 items-center justify-center rounded-lg text-black/45 hover:bg-zinc-100 hover:text-ink';
const dangerButton = 'flex size-8 shrink-0 items-center justify-center rounded-lg text-black/45 hover:bg-cta/5 hover:text-cta';

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="block min-w-0 text-[12.5px] font-medium text-black/70">
            {label}
            {children}
            {error && <span className="mt-1 block text-[11.5px] font-normal text-cta">{error}</span>}
        </label>
    );
}

function FormActions({ processing, submitLabel, onCancel }: { processing: boolean; submitLabel: string; onCancel: () => void }) {
    return (
        <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onCancel} className="rounded-lg px-3.5 py-2 text-[13px] text-black/60 hover:bg-zinc-100">
                Batal
            </button>
            <button type="submit" disabled={processing} className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-white disabled:opacity-60">
                {submitLabel}
            </button>
        </div>
    );
}

function SourceForm({ type, source, onDone }: { type: Type; source?: ScrapeSourceRow; onDone: () => void }) {
    const form = useForm({
        name: source?.name ?? '',
        url: source?.url ?? '',
        keywords: source?.keywords ?? '',
        is_active: source?.is_active ?? true,
        schedule: source?.schedule ?? 'harian',
        schedule_every: source?.schedule_every ? String(source.schedule_every) : '',
        schedule_time: source?.schedule_time ?? '',
    });
    const aiMode = form.data.url.trim() === '';

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => (form.reset(), onDone()) };
        if (source) form.patch(admin.scrapers.update.url(source.id), options);
        else form.post(admin.scrapers.store.url(type), options);
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <Field label="Nama sumber" error={form.errors.name}>
                <input autoFocus value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} maxLength={120} placeholder="Contoh: Info Beasiswa Indonesia" className={inputClass} />
            </Field>
            <Field label="URL website target (opsional)" error={form.errors.url}>
                <input value={form.data.url} onChange={(e) => form.setData('url', e.target.value)} maxLength={500} placeholder="https://… — kosongkan agar AI yang mencari" className={inputClass} />
            </Field>
            <p className="rounded-xl bg-surface px-3 py-2 text-[12px] leading-relaxed text-black/55">
                {aiMode ? (
                    <>
                        <Sparkles className="mr-1 inline size-3.5 text-brand" />
                        Tanpa URL: AI mencari {typeLabels[type].toLowerCase()} di internet berdasarkan kata kunci di bawah.
                    </>
                ) : (
                    <>Dengan URL: data dibaca langsung dari HTML halaman tersebut (judul, link, ringkasan, tenggat). Tidak perlu selector.</>
                )}
            </p>
            <Field label={aiMode ? 'Kata kunci pencarian AI' : 'Kata kunci (opsional, hanya dipakai tanpa URL)'} error={form.errors.keywords}>
                <textarea
                    value={form.data.keywords}
                    onChange={(e) => form.setData('keywords', e.target.value)}
                    rows={2}
                    maxLength={500}
                    placeholder="Contoh: beasiswa S2 luar negeri untuk lulusan teknik"
                    className="mt-1.5 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-[13.5px] font-normal outline-none focus:border-brand"
                />
            </Field>
            <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                Aktif (jalan otomatis sesuai jadwal)
            </label>
            {form.data.is_active && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Jadwal" error={form.errors.schedule}>
                        <select value={form.data.schedule} onChange={(e) => form.setData('schedule', e.target.value as 'harian' | 'menit' | 'mingguan')} className={inputClass}>
                            <option value="harian">Setiap hari</option>
                            <option value="menit">Setiap beberapa menit</option>
                            <option value="mingguan">Setiap beberapa minggu</option>
                        </select>
                    </Field>
                    {form.data.schedule === 'menit' ? (
                        <Field label="Setiap (menit)" error={form.errors.schedule_every}>
                            <input type="number" min={5} max={10080} value={form.data.schedule_every} onChange={(e) => form.setData('schedule_every', e.target.value)} placeholder="60" className={inputClass} />
                        </Field>
                    ) : (
                        <Field label="Jam (WIB)" error={form.errors.schedule_time}>
                            <input type="time" value={form.data.schedule_time} onChange={(e) => form.setData('schedule_time', e.target.value)} className={inputClass} />
                        </Field>
                    )}
                    {form.data.schedule === 'mingguan' && (
                        <Field label="Setiap (minggu)" error={form.errors.schedule_every}>
                            <input type="number" min={1} max={52} value={form.data.schedule_every} onChange={(e) => form.setData('schedule_every', e.target.value)} placeholder="1" className={inputClass} />
                        </Field>
                    )}
                    <p className="text-[11.5px] text-black/45 sm:col-span-2">Semua opsional. Kosong = setiap hari pukul 03.00 WIB, 60 menit, atau 1 minggu.</p>
                </div>
            )}
            <FormActions processing={form.processing} submitLabel={source ? 'Simpan perubahan' : 'Tambah sumber'} onCancel={onDone} />
        </form>
    );
}

function OpportunityForm({ type, categories, opportunity, onDone }: { type: Type; categories: Props['categories']; opportunity?: ManagedOpportunityRow; onDone: () => void }) {
    const form = useForm({
        title: opportunity?.title ?? '',
        summary: opportunity?.summary ?? '',
        deadline: opportunity?.deadline?.slice(0, 10) ?? '',
        source_url: opportunity?.source_url ?? '',
        category_id: opportunity?.category_id ? String(opportunity.category_id) : '',
        penyelenggara: opportunity?.details?.penyelenggara ?? '',
        lokasi: opportunity?.details?.lokasi ?? '',
        jenjang: opportunity?.details?.jenjang ?? '',
        tipe_kerja: opportunity?.details?.tipe_kerja ?? (type === 'magang' ? 'Magang' : ''),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => (form.reset(), onDone()) };
        if (opportunity) form.patch(admin.scrapers.opportunities.update.url(opportunity.id), options);
        else form.post(admin.scrapers.opportunities.store.url(type), options);
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <Field label="Judul" error={form.errors.title}>
                <input autoFocus value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} maxLength={255} className={inputClass} />
            </Field>
            <Field label="Ringkasan" error={form.errors.summary}>
                <textarea
                    value={form.data.summary}
                    onChange={(e) => form.setData('summary', e.target.value)}
                    rows={3}
                    maxLength={3000}
                    className="mt-1.5 w-full resize-y rounded-xl border border-black/10 px-3 py-2 text-[13.5px] font-normal outline-none focus:border-brand"
                />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Penyelenggara" error={form.errors.penyelenggara}>
                    <input value={form.data.penyelenggara} onChange={(e) => form.setData('penyelenggara', e.target.value)} maxLength={120} className={inputClass} />
                </Field>
                <Field label="Tenggat" error={form.errors.deadline}>
                    <input type="date" value={form.data.deadline} onChange={(e) => form.setData('deadline', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Link sumber resmi" error={form.errors.source_url}>
                    <input value={form.data.source_url} onChange={(e) => form.setData('source_url', e.target.value)} maxLength={255} placeholder="https://…" className={inputClass} />
                </Field>
                <Field label="Kategori" error={form.errors.category_id}>
                    <select value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value)} className={inputClass}>
                        <option value="">Tanpa kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </Field>
                {type === 'beasiswa' ? (
                    <>
                        <Field label="Jenjang" error={form.errors.jenjang}>
                            <select value={form.data.jenjang} onChange={(e) => form.setData('jenjang', e.target.value)} className={inputClass}>
                                <option value="">Semua jenjang</option>
                                {['S1', 'S2', 'S3'].map((v) => (
                                    <option key={v}>{v}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Lokasi" error={form.errors.lokasi}>
                            <select value={form.data.lokasi} onChange={(e) => form.setData('lokasi', e.target.value)} className={inputClass}>
                                <option value="">Tidak ditentukan</option>
                                {['Dalam negeri', 'Luar negeri'].map((v) => (
                                    <option key={v}>{v}</option>
                                ))}
                            </select>
                        </Field>
                    </>
                ) : (
                    <>
                        <Field label="Lokasi" error={form.errors.lokasi}>
                            <input value={form.data.lokasi} onChange={(e) => form.setData('lokasi', e.target.value)} maxLength={100} placeholder="Contoh: Jakarta / Remote" className={inputClass} />
                        </Field>
                        <Field label="Tipe pekerjaan" error={form.errors.tipe_kerja}>
                            <select value={form.data.tipe_kerja} onChange={(e) => form.setData('tipe_kerja', e.target.value)} className={inputClass}>
                                <option value="">Tidak ditentukan</option>
                                {['Magang', 'Penuh waktu', 'Paruh waktu'].map((v) => (
                                    <option key={v}>{v}</option>
                                ))}
                            </select>
                        </Field>
                    </>
                )}
            </div>
            <FormActions processing={form.processing} submitLabel={opportunity ? 'Simpan perubahan' : `Tambah ${typeLabels[type].toLowerCase()}`} onCancel={onDone} />
        </form>
    );
}

function Preview({ source }: { source: ScrapeSourceRow }) {
    const [state, setState] = useState<{ loading: boolean; items?: PreviewItem[]; error?: string }>({ loading: true });

    useEffect(() => {
        fetch(admin.scrapers.preview.url(source.id), { method: 'POST', headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() } })
            .then(async (r) => {
                const data = await r.json().catch(() => ({}));
                setState(r.ok ? { loading: false, items: data.items } : { loading: false, error: data.message ?? 'Pratinjau gagal.' });
            })
            .catch(() => setState({ loading: false, error: 'Koneksi terputus.' }));
    }, [source.id]);

    if (state.loading) return <p className="text-[13px] text-black/55">{source.url ? 'Membaca HTML halaman…' : 'AI sedang mencari di internet, bisa 1–2 menit…'}</p>;
    if (state.error) return <p className="break-words text-[13px] text-cta">{state.error}</p>;
    if (!state.items?.length) return <p className="text-[13px] text-black/55">Tidak ada item ditemukan dari sumber ini.</p>;

    return (
        <ul className="space-y-2">
            {state.items.map((item) => (
                <li key={item.url} className="rounded-xl border border-black/5 p-3 text-[12.5px]">
                    <p className="font-medium break-words">{item.title}</p>
                    <p className="truncate text-black/45">{item.url}</p>
                    {item.summary && <p className="mt-1 line-clamp-2 text-black/60">{item.summary}</p>}
                    <p className="mt-1 text-black/45">
                        Tenggat: {item.deadline ?? 'tidak terbaca'}
                        {item.organizer && ` · ${item.organizer}`}
                    </p>
                </li>
            ))}
        </ul>
    );
}

function ConfirmDelete({ text, onCancel, onConfirm }: { text: ReactNode; onCancel: () => void; onConfirm: () => void }) {
    return (
        <>
            <p className="text-[13px] text-black/65">{text}</p>
            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="rounded-lg px-3.5 py-2 text-[13px] text-black/60 hover:bg-zinc-100">
                    Batal
                </button>
                <button type="button" onClick={onConfirm} className="rounded-lg bg-cta px-3.5 py-2 text-[13px] font-medium text-white">
                    Hapus
                </button>
            </div>
        </>
    );
}

export default function ScrapersIndex({ type, sources, opportunities, filters, categories }: Props) {
    const [editingSource, setEditingSource] = useState<ScrapeSourceRow | 'new' | null>(null);
    const [editingItem, setEditingItem] = useState<ManagedOpportunityRow | 'new' | null>(null);
    const [previewing, setPreviewing] = useState<ScrapeSourceRow | null>(null);
    const [deleting, setDeleting] = useState<{ kind: 'source'; row: ScrapeSourceRow } | { kind: 'item'; row: ManagedOpportunityRow } | null>(null);
    const apply = useFilters(admin.scrapers.index.url(type), filters, ['opportunities', 'filters']);
    const label = typeLabels[type];
    const closeDelete = () => setDeleting(null);

    return (
        <>
            <Head title={`Scraper ${label}`} />
            <PageHeader title={`Scraper ${label}`} subtitle={`Kelola website sumber, jadwal scraper, dan data ${label.toLowerCase()} yang tampil di menu ${label}.`} />

            <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[15px] font-semibold">Sumber website</h2>
                    <button type="button" onClick={() => setEditingSource('new')} className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-[13px] font-medium text-white">
                        <Plus className="size-4" /> Tambah sumber
                    </button>
                </div>
                {sources.length === 0 ? (
                    <Panel>
                        <EmptyState icon={Globe} title="Belum ada sumber" text="Tambahkan URL website, atau kosongkan URL agar AI yang mencari." />
                    </Panel>
                ) : (
                    <div className="space-y-2">
                        {sources.map((source) => (
                            <div key={source.id} className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-start">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium break-words">{source.name}</p>
                                        <Badge tone={source.url ? 'sky' : 'brand'}>{source.url ? 'HTML' : 'Pencarian AI'}</Badge>
                                        {!source.is_active && <Badge>Nonaktif</Badge>}
                                        {source.last_status && <Badge tone={source.last_status === 'berhasil' ? 'green' : 'red'}>{source.last_status}</Badge>}
                                    </div>
                                    {source.url ? (
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="block truncate text-[12px] text-black/45 hover:text-brand">
                                            {source.url}
                                        </a>
                                    ) : (
                                        <p className="truncate text-[12px] text-black/45">Kata kunci: {source.keywords}</p>
                                    )}
                                    {source.is_active && (
                                        <p className="mt-1.5 text-[12px] text-black/55">
                                            Jadwal: {source.schedule_label}
                                            {source.next_run_at &&
                                                ` · berikutnya ${new Date(source.next_run_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB`}
                                        </p>
                                    )}
                                    <p className="mt-1 text-[12px] text-black/55">
                                        {source.opportunities_count} data tersimpan
                                        {source.last_run_at && ` · terakhir jalan ${timeAgo(source.last_run_at)} (${source.last_count} item)`}
                                    </p>
                                    {source.last_error && <p className="mt-1 text-[12px] break-words text-cta">{source.last_error}</p>}
                                </div>
                                <div className="flex gap-1">
                                    <button type="button" aria-label={`Pratinjau ${source.name}`} title="Pratinjau" onClick={() => setPreviewing(source)} className={iconButton}>
                                        <Eye className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Jalankan ${source.name}`}
                                        title="Jalankan"
                                        onClick={() => router.post(admin.scrapers.run.url(source.id), {}, { preserveScroll: true })}
                                        className={iconButton}
                                    >
                                        <Play className="size-4" />
                                    </button>
                                    <button type="button" aria-label={`Ubah ${source.name}`} title="Ubah" onClick={() => setEditingSource(source)} className={iconButton}>
                                        <Pencil className="size-4" />
                                    </button>
                                    <button type="button" aria-label={`Hapus ${source.name}`} title="Hapus" onClick={() => setDeleting({ kind: 'source', row: source })} className={dangerButton}>
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="mt-8">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[15px] font-semibold">Data {label.toLowerCase()}</h2>
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                        <SearchInput value={filters.q ?? ''} onSearch={(q) => apply({ q })} placeholder={`Cari ${label.toLowerCase()}`} />
                        <button type="button" onClick={() => setEditingItem('new')} className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-[13px] font-medium text-white">
                            <Plus className="size-4" /> Tambah manual
                        </button>
                    </div>
                </div>
                {opportunities.data.length === 0 ? (
                    <Panel>
                        <EmptyState title={`Belum ada data ${label.toLowerCase()}`} text="Jalankan scraper atau tambahkan data secara manual." />
                    </Panel>
                ) : (
                    <div className="space-y-2">
                        {opportunities.data.map((row) => (
                            <div key={row.id} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium break-words">{row.title}</p>
                                        <Badge tone={row.scrape_source ? 'sky' : 'amber'}>{row.scrape_source ? row.scrape_source.name : 'Manual'}</Badge>
                                    </div>
                                    <p className="mt-1 text-[12px] text-black/50">
                                        {row.details?.penyelenggara ?? 'Penyelenggara belum dicantumkan'} · {row.deadline ? `Tenggat ${formatDate(row.deadline)}` : 'Tanpa tenggat'}
                                    </p>
                                    {row.summary && <p className="mt-1 line-clamp-2 text-[12.5px] text-black/60">{row.summary}</p>}
                                </div>
                                <div className="flex gap-1">
                                    {row.source_url && (
                                        <a href={row.source_url} target="_blank" rel="noopener noreferrer" aria-label={`Buka sumber ${row.title}`} title="Buka sumber" className={iconButton}>
                                            <ExternalLink className="size-4" />
                                        </a>
                                    )}
                                    <button type="button" aria-label={`Ubah ${row.title}`} title="Ubah" onClick={() => setEditingItem(row)} className={iconButton}>
                                        <Pencil className="size-4" />
                                    </button>
                                    <button type="button" aria-label={`Hapus ${row.title}`} title="Hapus" onClick={() => setDeleting({ kind: 'item', row })} className={dangerButton}>
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <Pagination paginator={opportunities} only={['opportunities', 'filters']} onPerPage={(per_page) => apply({ per_page })} />
            </section>

            <Modal open={editingSource !== null} onClose={() => setEditingSource(null)} title={editingSource === 'new' ? 'Tambah sumber' : 'Ubah sumber'}>
                {editingSource !== null && (
                    <SourceForm key={editingSource === 'new' ? 'new' : editingSource.id} type={type} source={editingSource === 'new' ? undefined : editingSource} onDone={() => setEditingSource(null)} />
                )}
            </Modal>

            <Modal open={editingItem !== null} onClose={() => setEditingItem(null)} size="lg" title={editingItem === 'new' ? `Tambah ${label.toLowerCase()}` : `Ubah ${label.toLowerCase()}`}>
                {editingItem !== null && (
                    <OpportunityForm
                        key={editingItem === 'new' ? 'new' : editingItem.id}
                        type={type}
                        categories={categories}
                        opportunity={editingItem === 'new' ? undefined : editingItem}
                        onDone={() => setEditingItem(null)}
                    />
                )}
            </Modal>

            <Modal open={previewing !== null} onClose={() => setPreviewing(null)} size="lg" title={`Pratinjau ${previewing?.name ?? ''}`}>
                {previewing && <Preview key={previewing.id} source={previewing} />}
            </Modal>

            <Modal open={deleting !== null} onClose={closeDelete} title={deleting?.kind === 'source' ? 'Hapus sumber' : 'Hapus data'}>
                {deleting?.kind === 'source' && (
                    <ConfirmDelete
                        text={
                            <>
                                Hapus <span className="font-medium text-ink">{deleting.row.name}</span>? {deleting.row.opportunities_count} data hasil scrape ikut terhapus.
                            </>
                        }
                        onCancel={closeDelete}
                        onConfirm={() => router.delete(admin.scrapers.destroy.url(deleting.row.id), { preserveScroll: true, onSuccess: closeDelete })}
                    />
                )}
                {deleting?.kind === 'item' && (
                    <ConfirmDelete
                        text={
                            <>
                                Hapus <span className="font-medium text-ink">{deleting.row.title}</span>?
                            </>
                        }
                        onCancel={closeDelete}
                        onConfirm={() => router.delete(admin.scrapers.opportunities.destroy.url(deleting.row.id), { preserveScroll: true, onSuccess: closeDelete })}
                    />
                )}
            </Modal>
        </>
    );
}

ScrapersIndex.layout = AdminLayout;
