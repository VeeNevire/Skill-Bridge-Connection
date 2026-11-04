import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { motion } from 'motion/react';
import type { FormEvent, ReactNode } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { PageHeader } from '@/components/admin/ui';
import { Panel, PanelHeader } from '@/components/dashboard/panel';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import type { PlatformSettings } from '@/types';

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
    return (
        <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
            <span>
                <span className="block text-[13.5px] font-medium">{label}</span>
                <span className="mt-0.5 block text-[12px] text-black/50">{description}</span>
            </span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand' : 'bg-zinc-200')}
            >
                <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')}
                />
            </button>
        </label>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="block text-[12.5px] font-medium text-black/70">
            {label}
            {children}
            {error && <span className="mt-1 block text-[11.5px] font-normal text-cta">{error}</span>}
        </label>
    );
}

const input = 'mt-1.5 h-10 w-full rounded-xl border border-black/10 px-3 text-[13.5px] font-normal text-ink outline-none focus:border-brand';

export default function Settings({ settings }: { settings: PlatformSettings }) {
    const form = useForm(settings);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.submit(admin.settings.update(), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Pengaturan" />
            <PageHeader title="Pengaturan Platform" subtitle="Konfigurasi umum yang berlaku untuk seluruh pengguna." />

            <form onSubmit={submit} className="grid max-w-4xl gap-4 lg:grid-cols-2">
                <Panel>
                    <PanelHeader title="Identitas" subtitle="Nama dan kontak yang tampil ke pengguna" />
                    <div className="space-y-4">
                        <Field label="Nama platform" error={form.errors.platform_name}>
                            <input value={form.data.platform_name} onChange={(e) => form.setData('platform_name', e.target.value)} className={input} />
                        </Field>
                        <Field label="Email bantuan" error={form.errors.support_email}>
                            <input type="email" value={form.data.support_email} onChange={(e) => form.setData('support_email', e.target.value)} className={input} />
                        </Field>
                        <Field label="Pengumuman (opsional)" error={form.errors.announcement}>
                            <textarea
                                value={form.data.announcement ?? ''}
                                onChange={(e) => form.setData('announcement', e.target.value)}
                                rows={3}
                                maxLength={200}
                                placeholder="Contoh: Pendaftaran beasiswa batch 2 dibuka 1 Desember."
                                className="mt-1.5 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-[13.5px] font-normal text-ink outline-none focus:border-brand"
                            />
                        </Field>
                    </div>
                </Panel>

                <Panel>
                    <PanelHeader title="Kebijakan" subtitle="Aturan pendaftaran dan publikasi" />
                    <div className="divide-y divide-black/5">
                        <Toggle
                            checked={form.data.registration_open}
                            onChange={(v) => form.setData('registration_open', v)}
                            label="Pendaftaran akun dibuka"
                            description="Matikan sementara jika sedang ada pemeliharaan atau masalah keamanan."
                        />
                        <Toggle
                            checked={form.data.require_moderation}
                            onChange={(v) => form.setData('require_moderation', v)}
                            label="Wajib moderasi konten"
                            description="Konten baru dari mitra harus disetujui admin sebelum tampil."
                        />
                    </div>
                </Panel>

                <div className="flex items-center justify-end gap-3 lg:col-span-2">
                    {form.isDirty && <span className="text-[12px] text-black/45">Ada perubahan yang belum disimpan</span>}
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        disabled={form.processing || !form.isDirty}
                        className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-40"
                    >
                        <Save className="size-4" /> Simpan pengaturan
                    </motion.button>
                </div>
            </form>
        </>
    );
}

Settings.layout = AdminLayout;
