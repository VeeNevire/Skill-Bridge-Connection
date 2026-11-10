import { Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Inbox, Search, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { easeOut } from '@/components/landing/blur-text';
import { cn } from '@/lib/utils';
import type { CursorPaginated, Option, Paginated } from '@/types';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
    return (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 pt-2">
            <div>
                <h1 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
                {subtitle && <p className="mt-1 text-[13.5px] text-black/50">{subtitle}</p>}
            </div>
            {actions}
        </div>
    );
}

type FilterValue = string | number | null | undefined;

/**
 * Applies list filters through a partial Inertia reload: only the named props are re-fetched,
 * the page keeps its scroll position and the URL stays shareable.
 */
export function useFilters<T extends Record<string, FilterValue>>(url: string, current: T, only: string[]) {
    const apply = (next: Partial<T>) => {
        const merged = { ...current, ...next, page: undefined, cursor: undefined };
        const query = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== '' && v !== null && v !== undefined));

        router.get(url, query, { only, preserveState: true, preserveScroll: true, replace: true });
    };

    return apply;
}

export function Segmented({
    options,
    value,
    onChange,
    id,
    counts,
}: {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    id: string;
    counts?: Record<string, number>;
}) {
    return (
        <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 [scrollbar-width:none]">
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    role="tab"
                    aria-selected={value === o.value}
                    onClick={() => onChange(o.value)}
                    className={cn(
                        'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] whitespace-nowrap transition-colors',
                        value === o.value ? 'font-medium text-ink' : 'text-black/50 hover:text-ink',
                    )}
                >
                    {value === o.value && (
                        <motion.span layoutId={id} transition={{ type: 'spring', stiffness: 400, damping: 32 }} className="absolute inset-0 rounded-lg bg-zinc-100" />
                    )}
                    <span className="relative">{o.label}</span>
                    {counts?.[o.value] !== undefined && counts[o.value] > 0 && (
                        <span className="relative rounded-full bg-cta px-1.5 text-[10px] font-semibold text-white">{counts[o.value]}</span>
                    )}
                </button>
            ))}
        </div>
    );
}

/** Search box that only reports after the user stops typing, so each keystroke is not a request. */
export function SearchInput({ value, onSearch, placeholder }: { value: string; onSearch: (value: string) => void; placeholder: string }) {
    const [text, setText] = useState(value);
    const first = useRef(true);

    useEffect(() => {
        if (first.current) {
            first.current = false;

            return;
        }

        const id = setTimeout(() => onSearch(text.trim()), 350);

        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text]);

    return (
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-black/5 bg-white px-3 text-black/40 focus-within:border-brand/50 sm:max-w-xs">
            <Search className="size-4 shrink-0" />
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-black/35"
            />
            {text && (
                <button type="button" aria-label="Hapus pencarian" onClick={() => setText('')} className="text-black/35 hover:text-ink">
                    <X className="size-3.5" />
                </button>
            )}
        </label>
    );
}

export const PER_PAGE_OPTIONS = [10, 25, 50];

/** Page links; pass `onPerPage` to also let the viewer pick how many rows a page shows. */
export function Pagination<T>({ paginator, only, onPerPage }: { paginator: Paginated<T>; only: string[]; onPerPage?: (perPage: number) => void }) {
    const perPage = onPerPage && paginator.total > 0 && (
        <label className="flex items-center gap-1.5 text-[12px] text-black/45">
            Tampilkan
            <select
                value={paginator.per_page}
                onChange={(e) => onPerPage(Number(e.target.value))}
                className="h-8 rounded-lg border border-black/10 bg-white px-2 text-[12.5px] text-ink outline-none focus:border-brand"
            >
                {PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                        {n}
                    </option>
                ))}
            </select>
            per halaman
        </label>
    );

    if (paginator.last_page <= 1) {
        return paginator.total > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] text-black/45">{paginator.total} data</p>
                {perPage}
            </div>
        ) : null;
    }

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-[12px] text-black/45">
                    Menampilkan {paginator.from}–{paginator.to} dari {paginator.total}
                </p>
                {perPage}
            </div>
            <nav className="flex flex-wrap items-center gap-1">
                {paginator.links.map((link, i) => {
                    const isPrev = i === 0;
                    const isNext = i === paginator.links.length - 1;
                    const label = isPrev ? <ChevronLeft className="size-4" /> : isNext ? <ChevronRight className="size-4" /> : link.label;
                    const className = cn(
                        'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[12.5px] transition-colors',
                        link.active ? 'bg-ink font-medium text-white' : 'text-black/55 hover:bg-white hover:text-ink',
                        !link.url && 'pointer-events-none opacity-35',
                    );

                    return link.url ? (
                        <Link key={i} href={link.url} only={only} preserveScroll preserveState prefetch className={className}>
                            {label}
                        </Link>
                    ) : (
                        <span key={i} className={className}>
                            {label}
                        </span>
                    );
                })}
            </nav>
        </div>
    );
}

export function CursorPagination<T>({ paginator, only }: { paginator: CursorPaginated<T>; only: string[] }) {
    const button = (url: string | null, children: ReactNode) =>
        url ? (
            <Link href={url} only={only} preserveState preserveScroll className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-[12.5px] hover:bg-zinc-50">
                {children}
            </Link>
        ) : (
            <span className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12.5px] opacity-35">{children}</span>
        );

    return (
        <div className="mt-4 flex justify-end gap-2">
            {button(
                paginator.prev_page_url,
                <>
                    <ChevronLeft className="size-4" /> Lebih baru
                </>,
            )}
            {button(
                paginator.next_page_url,
                <>
                    Lebih lama <ChevronRight className="size-4" />
                </>,
            )}
        </div>
    );
}

const tones = {
    neutral: 'bg-zinc-100 text-zinc-600',
    brand: 'bg-violet-100 text-violet-700',
    sky: 'bg-sky-100 text-sky-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
};

export type Tone = keyof typeof tones;

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
    return <span className={cn('inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium', tones[tone])}>{children}</span>;
}

export const reviewTone: Record<string, Tone> = { menunggu: 'amber', disetujui: 'green', ditolak: 'red' };
export const typeTone: Record<string, Tone> = { beasiswa: 'brand', kelas: 'sky', lowongan: 'green', magang: 'amber' };
export const severityTone: Record<string, Tone> = { rendah: 'neutral', sedang: 'amber', tinggi: 'red' };

export function EmptyState({ icon: Icon = Inbox, title, text }: { icon?: LucideIcon; title: string; text?: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-100 text-black/35">
                <Icon className="size-5" />
            </span>
            <p className="mt-3 text-[14px] font-medium">{title}</p>
            {text && <p className="mt-1 max-w-xs text-[12.5px] text-black/45">{text}</p>}
        </motion.div>
    );
}

export function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'md' | 'lg' }) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    // Portal to <body>: a transformed ancestor (animated panels) would otherwise trap `position: fixed`.
    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: easeOut }}
                        className={cn(
                            // Capped to the viewport; long forms scroll inside instead of running off-screen.
                            'relative flex max-h-[calc(100dvh-2rem)] w-full flex-col rounded-2xl bg-white p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]',
                            size === 'lg' ? 'max-w-2xl' : 'max-w-md',
                        )}
                    >
                        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
                            <h2 className="min-w-0 truncate text-[15px] font-semibold">{title}</h2>
                            <button type="button" aria-label="Tutup" onClick={onClose} className="rounded-lg p-1 text-black/40 hover:bg-zinc-100 hover:text-ink">
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="-mx-5 min-h-0 overflow-y-auto px-5 pb-0.5">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

/** Asks for a reason before a rejecting action is sent. */
export function ReasonDialog({
    open,
    onClose,
    title,
    confirmLabel,
    onConfirm,
    processing,
    error,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    confirmLabel: string;
    onConfirm: (note: string) => void;
    processing: boolean;
    error?: string;
}) {
    const [note, setNote] = useState('');

    return (
        <Modal open={open} onClose={onClose} title={title}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onConfirm(note);
                }}
            >
                <label className="block text-[12.5px] font-medium text-black/70">
                    Alasan
                    <textarea
                        autoFocus
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        maxLength={255}
                        placeholder="Jelaskan alasan agar pengirim bisa memperbaiki…"
                        className="mt-1.5 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-[13.5px] font-normal outline-none focus:border-brand"
                    />
                </label>
                {error && <p className="mt-1 text-[11.5px] text-cta">{error}</p>}
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-lg px-3.5 py-2 text-[13px] text-black/60 hover:bg-zinc-100">
                        Batal
                    </button>
                    <button type="submit" disabled={processing} className="rounded-lg bg-cta px-3.5 py-2 text-[13px] font-medium text-white disabled:opacity-60">
                        {confirmLabel}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/** Shows the session flash message after every successful request. */
export function FlashToast() {
    const initial = usePage().props.flash?.success ?? null;
    const [message, setMessage] = useState<{ text: string; id: number } | null>(initial ? { text: initial, id: Date.now() } : null);

    useEffect(
        () =>
            router.on('success', (event) => {
                const text = event.detail.page.props.flash?.success;

                if (typeof text === 'string' && text) {
                    setMessage({ text, id: Date.now() });
                }
            }),
        [],
    );

    useEffect(() => {
        if (!message) {
            return;
        }

        const id = setTimeout(() => setMessage(null), 3200);

        return () => clearTimeout(id);
    }, [message]);

    return (
        <div className="pointer-events-none fixed right-4 bottom-4 z-[70]">
            <AnimatePresence>
                {message && (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-[13px] text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
                    >
                        <CheckCircle2 className="size-4 text-emerald-400" />
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const relative = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
const dateFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export function timeAgo(value: string) {
    const seconds = (new Date(value).getTime() - Date.now()) / 1000;
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];

    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) {
            return Math.abs(seconds) >= 7 * 86400 ? dateFormat.format(new Date(value)) : relative.format(Math.round(seconds / size), unit);
        }
    }

    return 'baru saja';
}

export function formatDate(value: string) {
    return dateFormat.format(new Date(value));
}

export const roleTone: Record<string, Tone> = { admin: 'brand', peserta: 'neutral', mentor: 'sky', mitra: 'green', perusahaan: 'amber' };

/** All roles an account holds, as compact badges. */
export function RoleBadges({ roles }: { roles: { id: number; name: string; label: string }[] }) {
    return (
        <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
                <Badge key={role.id} tone={roleTone[role.name]}>
                    {role.label}
                </Badge>
            ))}
        </div>
    );
}
