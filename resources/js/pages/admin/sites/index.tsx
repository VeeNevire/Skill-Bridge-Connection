import { Head, Link, router } from "@inertiajs/react";
import { ExternalLink, Link2, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
    Badge,
    EmptyState,
    PageHeader,
    Pagination,
    SearchInput,
    Segmented,
    typeTone,
    useFilters,
} from "@/components/admin/ui";
import { Panel } from "@/components/dashboard/panel";
import admin from "@/routes/admin";
import type { DiscoveredSiteRow, Paginated } from "@/types";

type Filters = {
    type?: string;
    period?: string;
    status?: string;
    q?: string;
    per_page?: number;
};
type Props = {
    sites: Paginated<DiscoveredSiteRow>;
    filters: Filters;
    periods: string[];
};

const only = ["sites", "filters", "periods"];

const typeLabels: Record<string, string> = {
    beasiswa: "Beasiswa",
    magang: "Magang",
    lowongan: "Lowongan",
};

const monthLabel = (period: string) =>
    new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
        new Date(`${period}-01T00:00:00`),
    );

export default function SitesIndex({ sites, filters, periods }: Props) {
    const apply = useFilters(admin.scrapers.sites.index.url(), filters, only);

    const toggle = (site: DiscoveredSiteRow) =>
        router.patch(
            admin.scrapers.sites.update.url(site.id),
            { is_approved: !site.is_approved },
            { preserveScroll: true, preserveState: true },
        );

    const runNow = () =>
        router.post(
            admin.scrapers.sites.run.url(),
            {},
            { preserveScroll: true },
        );

    return (
        <>
            <Head title="Direktori Website" />
            <PageHeader
                title="Direktori Website"
                subtitle="Website program beasiswa, magang, dan lowongan hasil pencarian AI tiap tanggal 1. Centang untuk menjadikannya sumber scraper dan langsung menarik datanya."
                actions={
                    <button
                        type="button"
                        onClick={runNow}
                        className="flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-[13px] font-medium text-white hover:bg-brand/90"
                    >
                        <Search className="size-4" /> Cari sekarang
                    </button>
                }
            />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Segmented
                    id="site-type"
                    value={filters.type ?? ""}
                    onChange={(type) => apply({ type })}
                    options={[
                        { value: "", label: "Semua" },
                        ...Object.entries(typeLabels).map(([value, label]) => ({
                            value,
                            label,
                        })),
                    ]}
                />
                <Segmented
                    id="site-status"
                    value={filters.status ?? ""}
                    onChange={(status) => apply({ status })}
                    options={[
                        { value: "", label: "Semua status" },
                        { value: "disetujui", label: "Disetujui" },
                        { value: "belum", label: "Belum" },
                    ]}
                />
                <select
                    aria-label="Bulan"
                    value={filters.period ?? ""}
                    onChange={(e) => apply({ period: e.target.value })}
                    className="h-10 rounded-xl border border-black/5 bg-white px-3 text-[13px] outline-none focus:border-brand"
                >
                    <option value="">Semua bulan</option>
                    {periods.map((p) => (
                        <option key={p} value={p}>
                            {monthLabel(p)}
                        </option>
                    ))}
                </select>
                <SearchInput
                    value={filters.q ?? ""}
                    onSearch={(q) => apply({ q })}
                    placeholder="Cari nama atau domain…"
                />
            </div>

            <Panel className="p-2 sm:p-3">
                {sites.data.length === 0 ? (
                    <EmptyState
                        icon={Link2}
                        title="Belum ada website"
                        text="Klik “Cari sekarang” atau tunggu pencarian bulanan."
                    />
                ) : (
                    <ul className="divide-y divide-black/5">
                        {sites.data.map((site) => (
                            <li
                                key={site.id}
                                className="flex items-start gap-3 px-2 py-3"
                            >
                                <input
                                    type="checkbox"
                                    checked={site.is_approved}
                                    onChange={() => toggle(site)}
                                    aria-label={`Setujui ${site.name}`}
                                    className="mt-1 size-4 shrink-0 accent-brand"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[13.5px] font-medium">
                                            {site.name}
                                        </span>
                                        <Badge tone={typeTone[site.type]}>
                                            {typeLabels[site.type] ?? site.type}
                                        </Badge>
                                    </div>
                                    <a
                                        href={site.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] break-all text-brand hover:underline"
                                    >
                                        {site.url}{" "}
                                        <ExternalLink className="size-3 shrink-0" />
                                    </a>
                                    {site.description && (
                                        <p className="mt-1 text-[12.5px] leading-snug text-black/55">
                                            {site.description}
                                        </p>
                                    )}
                                    {site.is_approved &&
                                        site.scrape_source_id && (
                                            <Link
                                                href={admin.scrapers.index.url(
                                                    site.type,
                                                )}
                                                className="mt-1 inline-block text-[12px] font-medium text-emerald-600 hover:underline"
                                            >
                                                Aktif di scraper{" "}
                                                {typeLabels[site.type]} →
                                            </Link>
                                        )}
                                </div>
                                <span className="shrink-0 text-[11.5px] text-black/40">
                                    {monthLabel(site.period)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
            <Pagination
                paginator={sites}
                only={only}
                onPerPage={(per_page) => apply({ per_page })}
            />
        </>
    );
}

SitesIndex.layout = AdminLayout;
