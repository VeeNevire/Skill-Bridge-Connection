import { router } from "@inertiajs/react";
import { AnimatePresence, motion } from "motion/react";
import { Flag, LoaderCircle, Package, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { NavItem } from "@/components/dashboard/dashboard-layout";
import { easeOut } from "@/components/landing/blur-text";
import { SearchIcon } from "@/components/landing/icons";
import { cn } from "@/lib/utils";
import admin from "@/routes/admin";

type Hit = {
    id: number | string;
    title: string;
    subtitle?: string;
    href: string;
};
type Results = { users: Hit[]; content: Hit[]; reports: Hit[] };
type Group = {
    key: string;
    label: string;
    icon?: LucideIcon;
    hits: (Hit & { icon?: LucideIcon })[];
};

const EMPTY: Results = { users: [], content: [], reports: [] };

/**
 * Header search for the admin panel: matches menu pages instantly, then users, listings and
 * reports from the server, with arrow-key navigation. Enter opens the highlighted (or first) result.
 */
export function AdminSearch({
    pages,
    placeholder,
}: {
    pages: NavItem[];
    placeholder: string;
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Results>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const term = query.trim();

    // Debounced server lookup; each new keystroke aborts the previous request.
    useEffect(() => {
        if (term.length < 2) {
            setResults(EMPTY);
            setLoading(false);

            return;
        }

        const controller = new AbortController();
        setLoading(true);
        const timer = window.setTimeout(() => {
            fetch(admin.search.url({ query: { q: term } }), {
                headers: { Accept: "application/json" },
                signal: controller.signal,
            })
                .then((response) => (response.ok ? response.json() : EMPTY))
                .then((data: Results) => {
                    setResults(data);
                    setLoading(false);
                })
                .catch((error: unknown) => {
                    if ((error as Error).name !== "AbortError") {
                        setResults(EMPTY);
                        setLoading(false);
                    }
                });
        }, 200);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [term]);

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node))
                setOpen(false);
        };

        document.addEventListener("mousedown", close);

        return () => document.removeEventListener("mousedown", close);
    }, []);

    const groups = useMemo<Group[]>(() => {
        const lower = term.toLowerCase();
        const pageHits = term
            ? pages
                  .flatMap((page): (NavItem & { parent?: string })[] =>
                      page.children?.length
                          ? page.children.map((c) => ({
                                ...c,
                                parent: page.label,
                            }))
                          : [page],
                  )
                  .filter(
                      (page) =>
                          page.href &&
                          `${page.label} ${page.parent ?? ""}`
                              .toLowerCase()
                              .includes(lower),
                  )
                  .slice(0, 4)
                  .map((page) => ({
                      id: page.key,
                      title: page.label,
                      subtitle: page.parent,
                      href: page.href!,
                      icon: page.icon,
                  }))
            : [];

        return [
            { key: "pages", label: "Halaman", hits: pageHits },
            {
                key: "users",
                label: "Pengguna",
                icon: User,
                hits: results.users,
            },
            {
                key: "content",
                label: "Konten",
                icon: Package,
                hits: results.content,
            },
            {
                key: "reports",
                label: "Laporan",
                icon: Flag,
                hits: results.reports,
            },
        ].filter((group) => group.hits.length > 0);
    }, [pages, results, term]);

    const flat = groups.flatMap((group) => group.hits);

    useEffect(() => setHighlight(0), [term, results]);

    const go = (hit: Hit | undefined) => {
        if (!hit) return;
        setOpen(false);
        setQuery("");
        (document.activeElement as HTMLElement | null)?.blur();
        router.visit(hit.href);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setHighlight((i) => Math.min(i + 1, flat.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlight((i) => Math.max(i - 1, 0));
        } else if (event.key === "Enter") {
            event.preventDefault();
            go(flat[highlight] ?? flat[0]);
        } else if (event.key === "Escape") {
            setOpen(false);
            event.currentTarget.blur();
        }
    };

    const showPanel = open && term.length > 0;
    let index = -1;

    return (
        <div
            ref={rootRef}
            data-tour="search"
            className="relative hidden max-w-sm min-w-0 flex-1 sm:block"
        >
            <div className="flex h-10 items-center gap-2 rounded-xl border border-black/5 bg-white px-3 text-black/40 focus-within:border-brand/40">
                {loading ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin" />
                ) : (
                    <SearchIcon className="size-4 shrink-0" />
                )}
                <input
                    data-search-input
                    role="combobox"
                    aria-expanded={showPanel}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        showPanel && flat[highlight]
                            ? `${listId}-${highlight}`
                            : undefined
                    }
                    aria-label={placeholder}
                    placeholder={placeholder}
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    className="w-full min-w-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-black/35"
                />
                <kbd className="rounded-md border border-black/10 px-1.5 text-[10px]">
                    /
                </kbd>
            </div>

            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15, ease: easeOut }}
                        className="absolute inset-x-0 z-40 mt-2 max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-black/5 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] [scrollbar-width:none] sm:right-auto sm:w-[26rem]"
                    >
                        <ul
                            id={listId}
                            role="listbox"
                            aria-label="Hasil pencarian"
                        >
                            {groups.map((group) => (
                                <li key={group.key} role="presentation">
                                    <p className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-black/35 uppercase">
                                        {group.label}
                                    </p>
                                    <ul role="presentation">
                                        {group.hits.map((hit) => {
                                            index += 1;
                                            const i = index;
                                            const Icon =
                                                hit.icon ??
                                                group.icon ??
                                                SearchIcon;

                                            return (
                                                <li
                                                    key={`${group.key}-${hit.id}`}
                                                    id={`${listId}-${i}`}
                                                    role="option"
                                                    aria-selected={
                                                        i === highlight
                                                    }
                                                    onMouseEnter={() =>
                                                        setHighlight(i)
                                                    }
                                                    onMouseDown={(event) =>
                                                        event.preventDefault()
                                                    }
                                                    onClick={() => go(hit)}
                                                    className={cn(
                                                        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2",
                                                        i === highlight &&
                                                            "bg-brand/10",
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                                                            i === highlight
                                                                ? "bg-white text-brand"
                                                                : "bg-surface text-black/45",
                                                        )}
                                                    >
                                                        <Icon className="size-4" />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-[13px] text-ink">
                                                            {hit.title}
                                                        </span>
                                                        {hit.subtitle && (
                                                            <span className="block truncate text-[11.5px] text-black/45">
                                                                {hit.subtitle}
                                                            </span>
                                                        )}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </li>
                            ))}
                        </ul>

                        {flat.length === 0 && (
                            <p className="px-3 py-6 text-center text-[12.5px] text-black/45">
                                {loading
                                    ? "Mencari…"
                                    : term.length < 2
                                      ? "Ketik minimal 2 huruf untuk mencari pengguna, konten, dan laporan."
                                      : `Tidak ada hasil untuk “${term}”.`}
                            </p>
                        )}

                        {flat.length > 0 && (
                            <p className="mt-1 flex items-center gap-3 border-t border-black/5 px-3 pt-2 pb-1 text-[11px] text-black/35">
                                <span>↑↓ pilih</span>
                                <span>Enter buka</span>
                                <span>Esc tutup</span>
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
