import { useForm } from '@inertiajs/react';
import type { RouteDefinition } from '@/wayfinder';

export type DataFormField = {
    key: string;
    label: string;
    type?:
        | 'text'
        | 'email'
        | 'url'
        | 'date'
        | 'datetime-local'
        | 'number'
        | 'password'
        | 'textarea'
        | 'checkbox'
        | 'select';
    options?: { value: string; label: string }[];
};
export function DataForm({
    fields,
    initial = {},
    action,
    title,
    button = 'Simpan',
    onSuccess,
}: {
    fields: DataFormField[];
    initial?: Record<string, string | boolean>;
    action: RouteDefinition<'post' | 'put' | 'patch' | 'delete'>;
    title?: string;
    button?: string;
    onSuccess?: () => void;
}) {
    const form = useForm<Record<string, string | boolean>>(
        Object.fromEntries(
            fields.map((field) => {
                const value =
                    initial[field.key] ??
                    (field.type === 'checkbox' ? false : '');
                if (field.type === 'datetime-local' && value) {
                    const date = new Date(String(value));
                    return [
                        field.key,
                        new Date(
                            date.getTime() - date.getTimezoneOffset() * 60000,
                        )
                            .toISOString()
                            .slice(0, 16),
                    ];
                }
                return [field.key, value];
            }),
        ),
    );
    const inputClass =
        'mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-brand';
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.transform((data) =>
                    Object.fromEntries(
                        Object.entries(data).map(([key, value]) => [
                            key,
                            value &&
                            fields.find((field) => field.key === key)?.type ===
                                'datetime-local'
                                ? new Date(String(value)).toISOString()
                                : value,
                        ]),
                    ),
                );
                form.submit(action, {
                    preserveScroll: true,
                    onFinish: () => {
                        const keys = fields
                            .filter((field) => field.type === 'password')
                            .map((field) => field.key);
                        if (keys.length) form.reset(...keys);
                    },
                    onSuccess,
                });
            }}
            className="space-y-3 rounded-2xl border border-black/5 bg-white p-5"
        >
            {title && <h2 className="font-semibold">{title}</h2>}
            {fields.map((field) => (
                <label className="block text-sm text-black/70" key={field.key}>
                    {field.type === 'checkbox' ? (
                        <span className="flex items-start gap-2">
                            <input
                                className="mt-1 accent-brand"
                                type="checkbox"
                                checked={Boolean(form.data[field.key])}
                                onChange={(e) =>
                                    form.setData(field.key, e.target.checked)
                                }
                            />
                            {field.label}
                        </span>
                    ) : (
                        <>
                            {field.label}
                            {field.type === 'textarea' ? (
                                <textarea
                                    rows={3}
                                    className={inputClass}
                                    value={String(form.data[field.key])}
                                    onChange={(e) =>
                                        form.setData(field.key, e.target.value)
                                    }
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    className={inputClass}
                                    value={String(form.data[field.key])}
                                    onChange={(e) =>
                                        form.setData(field.key, e.target.value)
                                    }
                                >
                                    <option value="">Pilih</option>
                                    {field.options?.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    className={inputClass}
                                    type={field.type ?? 'text'}
                                    value={String(form.data[field.key])}
                                    onChange={(e) =>
                                        form.setData(field.key, e.target.value)
                                    }
                                />
                            )}
                        </>
                    )}
                    {form.errors[field.key] && (
                        <span
                            role="alert"
                            className="mt-1 block text-xs text-cta"
                        >
                            {form.errors[field.key]}
                        </span>
                    )}
                </label>
            ))}
            <button
                disabled={form.processing}
                className="rounded-xl bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
            >
                {form.processing ? 'Menyimpan…' : button}
            </button>
            {form.recentlySuccessful && (
                <p role="status" className="text-sm text-emerald-700">
                    Perubahan berhasil disimpan.
                </p>
            )}
        </form>
    );
}
