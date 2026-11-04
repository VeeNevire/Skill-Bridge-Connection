import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { update } from '@/routes/passport';

type Education = {
    institution: string;
    degree: string;
    field: string | null;
    start_year: number | string | null;
    end_year: number | string | null;
};
type Skill = { name: string; level: string };
type Experience = {
    title: string;
    organization: string;
    description: string | null;
};
export type Passport = {
    interests: string;
    preferred_location: string;
    preferred_level: string;
    preferred_opportunity: string;
    name: string;
    email: string;
    phone: string;
    bio: string;
    portfolio_url: string;
    educations: Education[];
    skills: Skill[];
    experiences: Experience[];
};

const inputClass =
    'mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand';
function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="block text-[13px] font-medium text-black/70">
            {label}
            {children}
            {error && (
                <span role="alert" className="mt-1 block text-xs text-cta">
                    {error}
                </span>
            )}
        </label>
    );
}
function Section({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-black/50">{description}</p>
            <div className="mt-5 space-y-4">{children}</div>
        </section>
    );
}
function AddButton({
    onClick,
    children,
    disabled,
}: {
    onClick: () => void;
    children: ReactNode;
    disabled: boolean;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand disabled:opacity-40"
        >
            <Plus className="size-4" />
            {children}
        </button>
    );
}
function RemoveButton({
    onClick,
    label,
}: {
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="inline-flex items-center gap-1.5 text-xs text-cta"
        >
            <Trash2 className="size-4" />
            Hapus
        </button>
    );
}

export function TalentPassport({ passport }: { passport: Passport }) {
    const form = useForm(passport);
    const errors = form.errors as Record<string, string | undefined>;
    const change = <T,>(items: T[], index: number, patch: Partial<T>): T[] =>
        items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(update(), { preserveScroll: true });
    };
    return (
        <form
            onSubmit={submit}
            className="mx-auto max-w-4xl space-y-4"
            noValidate
        >
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Talent Passport
                </h1>
                <p className="mt-1 text-sm text-black/50">
                    Susun profil pendidikan dan pengalaman Anda dalam satu
                    tempat.
                </p>
            </div>
            {form.recentlySuccessful && (
                <p
                    role="status"
                    className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                    Talent Passport berhasil disimpan.
                </p>
            )}
            {form.hasErrors && (
                <p
                    role="alert"
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm text-cta"
                >
                    Periksa kembali kolom yang ditandai sebelum menyimpan.
                </p>
            )}
            <Section
                title="Profil dasar"
                description="Informasi untuk mengenal Anda."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nama lengkap" error={errors.name}>
                        <input
                            className={inputClass}
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            maxLength={255}
                        />
                    </Field>
                    <Field label="Email">
                        <input
                            className={inputClass + ' bg-zinc-50 text-black/50'}
                            value={form.data.email}
                            readOnly
                        />
                    </Field>
                    <Field label="Nomor telepon" error={errors.phone}>
                        <input
                            className={inputClass}
                            value={form.data.phone}
                            onChange={(e) =>
                                form.setData('phone', e.target.value)
                            }
                            autoComplete="tel"
                        />
                    </Field>
                    <Field
                        label="Tautan portofolio"
                        error={errors.portfolio_url}
                    >
                        <input
                            className={inputClass}
                            value={form.data.portfolio_url}
                            onChange={(e) =>
                                form.setData('portfolio_url', e.target.value)
                            }
                            placeholder="https://"
                            type="url"
                        />
                    </Field>
                </div>
                <Field label="Tentang saya" error={errors.bio}>
                    <textarea
                        className={inputClass}
                        rows={3}
                        value={form.data.bio}
                        onChange={(e) => form.setData('bio', e.target.value)}
                        placeholder="Ceritakan minat dan tujuan Anda"
                    />
                </Field>
            </Section>
            <Section
                title="Minat dan preferensi"
                description="Tentukan bidang dan peluang yang ingin Anda jelajahi."
            >
                <Field
                    label="Minat bidang studi dan karier"
                    error={errors.interests}
                >
                    <textarea
                        className={inputClass}
                        value={form.data.interests}
                        onChange={(e) =>
                            form.setData('interests', e.target.value)
                        }
                    />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label="Preferensi lokasi"
                        error={errors.preferred_location}
                    >
                        <input
                            className={inputClass}
                            value={form.data.preferred_location}
                            onChange={(e) =>
                                form.setData(
                                    'preferred_location',
                                    e.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field
                        label="Preferensi jenjang"
                        error={errors.preferred_level}
                    >
                        <input
                            className={inputClass}
                            value={form.data.preferred_level}
                            onChange={(e) =>
                                form.setData('preferred_level', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Jenis peluang"
                        error={errors.preferred_opportunity}
                    >
                        <select
                            className={inputClass}
                            value={form.data.preferred_opportunity}
                            onChange={(e) =>
                                form.setData(
                                    'preferred_opportunity',
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">Semua jenis</option>
                            <option value="beasiswa">Beasiswa</option>
                            <option value="kelas">Kelas</option>
                            <option value="lowongan">Lowongan</option>
                        </select>
                    </Field>
                </div>
            </Section>
            <Section
                title="Pendidikan"
                description="Tambahkan riwayat pendidikan Anda."
            >
                {form.data.educations.map((item, i) => (
                    <div
                        key={i}
                        className="space-y-3 rounded-xl border border-black/5 bg-zinc-50/60 p-4"
                    >
                        <div className="flex items-center justify-between text-sm font-medium">
                            <span>Pendidikan {i + 1}</span>
                            <RemoveButton
                                label={`Hapus pendidikan ${i + 1}`}
                                onClick={() =>
                                    form.setData(
                                        'educations',
                                        form.data.educations.filter(
                                            (_, n) => n !== i,
                                        ),
                                    )
                                }
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field
                                label="Institusi"
                                error={errors[`educations.${i}.institution`]}
                            >
                                <input
                                    className={inputClass}
                                    value={item.institution}
                                    onChange={(e) =>
                                        form.setData(
                                            'educations',
                                            change(form.data.educations, i, {
                                                institution: e.target.value,
                                            }),
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Jenjang"
                                error={errors[`educations.${i}.degree`]}
                            >
                                <input
                                    className={inputClass}
                                    value={item.degree}
                                    onChange={(e) =>
                                        form.setData(
                                            'educations',
                                            change(form.data.educations, i, {
                                                degree: e.target.value,
                                            }),
                                        )
                                    }
                                    placeholder="Contoh: S1"
                                />
                            </Field>
                            <Field
                                label="Bidang studi"
                                error={errors[`educations.${i}.field`]}
                            >
                                <input
                                    className={inputClass}
                                    value={item.field ?? ''}
                                    onChange={(e) =>
                                        form.setData(
                                            'educations',
                                            change(form.data.educations, i, {
                                                field: e.target.value,
                                            }),
                                        )
                                    }
                                />
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field
                                    label="Tahun mulai"
                                    error={errors[`educations.${i}.start_year`]}
                                >
                                    <input
                                        className={inputClass}
                                        type="number"
                                        value={item.start_year ?? ''}
                                        onChange={(e) =>
                                            form.setData(
                                                'educations',
                                                change(
                                                    form.data.educations,
                                                    i,
                                                    {
                                                        start_year:
                                                            e.target.value,
                                                    },
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Tahun selesai"
                                    error={errors[`educations.${i}.end_year`]}
                                >
                                    <input
                                        className={inputClass}
                                        type="number"
                                        value={item.end_year ?? ''}
                                        onChange={(e) =>
                                            form.setData(
                                                'educations',
                                                change(
                                                    form.data.educations,
                                                    i,
                                                    {
                                                        end_year:
                                                            e.target.value,
                                                    },
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>
                ))}
                <AddButton
                    disabled={form.data.educations.length >= 20}
                    onClick={() =>
                        form.setData('educations', [
                            ...form.data.educations,
                            {
                                institution: '',
                                degree: '',
                                field: '',
                                start_year: '',
                                end_year: '',
                            },
                        ])
                    }
                >
                    Tambah pendidikan
                </AddButton>
            </Section>
            <Section
                title="Keterampilan"
                description="Cantumkan keterampilan dan tingkat penguasaan Anda."
            >
                {form.data.skills.map((item, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-black/5 bg-zinc-50/60 p-4"
                    >
                        <div className="flex justify-between text-sm font-medium">
                            <span>Keterampilan {i + 1}</span>
                            <RemoveButton
                                label={`Hapus keterampilan ${i + 1}`}
                                onClick={() =>
                                    form.setData(
                                        'skills',
                                        form.data.skills.filter(
                                            (_, n) => n !== i,
                                        ),
                                    )
                                }
                            />
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Field
                                label="Keterampilan"
                                error={errors[`skills.${i}.name`]}
                            >
                                <input
                                    className={inputClass}
                                    value={item.name}
                                    onChange={(e) =>
                                        form.setData(
                                            'skills',
                                            change(form.data.skills, i, {
                                                name: e.target.value,
                                            }),
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Tingkat penguasaan"
                                error={errors[`skills.${i}.level`]}
                            >
                                <select
                                    className={inputClass}
                                    value={item.level}
                                    onChange={(e) =>
                                        form.setData(
                                            'skills',
                                            change(form.data.skills, i, {
                                                level: e.target.value,
                                            }),
                                        )
                                    }
                                >
                                    <option value="pemula">Pemula</option>
                                    <option value="menengah">Menengah</option>
                                    <option value="mahir">Mahir</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                ))}
                <AddButton
                    disabled={form.data.skills.length >= 30}
                    onClick={() =>
                        form.setData('skills', [
                            ...form.data.skills,
                            { name: '', level: 'pemula' },
                        ])
                    }
                >
                    Tambah keterampilan
                </AddButton>
            </Section>
            <Section
                title="Pengalaman"
                description="Tambahkan pengalaman organisasi, proyek, atau pekerjaan."
            >
                {form.data.experiences.map((item, i) => (
                    <div
                        key={i}
                        className="space-y-3 rounded-xl border border-black/5 bg-zinc-50/60 p-4"
                    >
                        <div className="flex justify-between text-sm font-medium">
                            <span>Pengalaman {i + 1}</span>
                            <RemoveButton
                                label={`Hapus pengalaman ${i + 1}`}
                                onClick={() =>
                                    form.setData(
                                        'experiences',
                                        form.data.experiences.filter(
                                            (_, n) => n !== i,
                                        ),
                                    )
                                }
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field
                                label="Peran atau nama proyek"
                                error={errors[`experiences.${i}.title`]}
                            >
                                <input
                                    className={inputClass}
                                    value={item.title}
                                    onChange={(e) =>
                                        form.setData(
                                            'experiences',
                                            change(form.data.experiences, i, {
                                                title: e.target.value,
                                            }),
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Organisasi"
                                error={errors[`experiences.${i}.organization`]}
                            >
                                <input
                                    className={inputClass}
                                    value={item.organization}
                                    onChange={(e) =>
                                        form.setData(
                                            'experiences',
                                            change(form.data.experiences, i, {
                                                organization: e.target.value,
                                            }),
                                        )
                                    }
                                />
                            </Field>
                        </div>
                        <Field
                            label="Deskripsi"
                            error={errors[`experiences.${i}.description`]}
                        >
                            <textarea
                                className={inputClass}
                                rows={3}
                                value={item.description ?? ''}
                                onChange={(e) =>
                                    form.setData(
                                        'experiences',
                                        change(form.data.experiences, i, {
                                            description: e.target.value,
                                        }),
                                    )
                                }
                            />
                        </Field>
                    </div>
                ))}
                <AddButton
                    disabled={form.data.experiences.length >= 20}
                    onClick={() =>
                        form.setData('experiences', [
                            ...form.data.experiences,
                            { title: '', organization: '', description: '' },
                        ])
                    }
                >
                    Tambah pengalaman
                </AddButton>
            </Section>
            <div className="flex justify-end pb-6">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                    {form.processing ? 'Menyimpan…' : 'Simpan Talent Passport'}
                </button>
            </div>
        </form>
    );
}
