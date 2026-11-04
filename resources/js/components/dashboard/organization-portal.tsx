import { Head, router } from '@inertiajs/react';
import { FlashToast, Pagination } from '@/components/admin/ui';
import { DashboardLayout } from './dashboard-layout';
import type { DataFormField } from './data-form';
import { DataForm } from './data-form';
import { partnerNav, partnerAccountNav } from '@/data/partner';
import { companyNav, companyAccountNav } from '@/data/company';
import { dashboard as partnerDashboard } from '@/routes/partner';
import { dashboard as companyDashboard } from '@/routes/company';
import {
    store,
    update,
    program,
    member,
    removeMember,
    candidate,
    lesson,
    programUpdate,
    programClose,
} from '@/routes/organizations';
import type { Paginated } from '@/types';

type Organization = {
    id: number;
    name: string;
    email: string;
    type: string;
    website: string | null;
    description: string | null;
    status: string;
};
type Program = {
    details: Record<string, string | null> | null;
    category_id: number | null;
    id: number;
    title: string;
    type: string;
    summary: string;
    status: string;
    review_note: string | null;
    deadline: string | null;
    source_url: string;
    accepts_applications: boolean;
};
type Candidate = {
    id: number;
    name: string;
    email: string;
    title: string;
    message: string;
    portfolio_url: string | null;
    stage: string;
    interview_at: string | null;
    interview_location: string | null;
};
export type Portal = {
    categories: { id: number; name: string }[];
    organizations: Organization[];
    organization: Organization | null;
    permission: string | null;
    company: boolean;
    section: string;
    programs: Paginated<Program>;
    applications: Paginated<Candidate>;
    members: Paginated<{
        id: number;
        name: string;
        email: string;
        permission: string;
    }>;
    counts: Record<string, number>;
    /** Owners and reviewers only; program editors never receive applicant data. */
    canViewApplicants: boolean;
};

const applicantSections = ['applicants', 'candidates', 'interviews'];
export function OrganizationRegistration() {
    return (
        <DataForm
            title="Daftarkan organisasi"
            action={store()}
            button="Ajukan verifikasi organisasi"
            fields={[
                { key: 'name', label: 'Nama organisasi' },
                {
                    key: 'type',
                    label: 'Jenis organisasi',
                    type: 'select',
                    options: [
                        { value: 'institusi', label: 'Institusi pendidikan' },
                        { value: 'yayasan', label: 'Yayasan' },
                        { value: 'perusahaan', label: 'Perusahaan' },
                    ],
                },
                { key: 'email', label: 'Email organisasi', type: 'email' },
                { key: 'website', label: 'Situs resmi', type: 'url' },
                {
                    key: 'description',
                    label: 'Deskripsi organisasi',
                    type: 'textarea',
                },
            ]}
        />
    );
}
export function OrganizationPortal({ portal }: { portal: Portal }) {
    const { organization, section, company, permission } = portal;
    const nav = (company ? companyNav : partnerNav).filter((item) => portal.canViewApplicants || !applicantSections.includes(item.key));
    const accountNav = company ? companyAccountNav : partnerAccountNav;
    const route = company ? companyDashboard : partnerDashboard;
    const programFields: DataFormField[] = [
        {
            key: 'category_id',
            label: 'Kategori',
            type: 'select',
            options: portal.categories.map((item) => ({
                value: String(item.id),
                label: item.name,
            })),
        },
        {
            key: 'level',
            label: 'Jenjang atau tingkat kelas (S1, S2, Pemula, Menengah)',
        },
        { key: 'location', label: 'Lokasi' },
        { key: 'duration', label: 'Durasi kelas' },
        { key: 'work_type', label: 'Tipe pekerjaan' },
        {
            key: 'requirements',
            label: 'Checklist persyaratan (satu persyaratan per baris)',
            type: 'textarea',
        },
        { key: 'title', label: 'Judul' },
        {
            key: 'type',
            label: 'Jenis',
            type: 'select',
            options: company
                ? [{ value: 'lowongan', label: 'Lowongan' }]
                : [
                      { value: 'beasiswa', label: 'Beasiswa' },
                      { value: 'kelas', label: 'Kelas' },
                  ],
        },
        {
            key: 'summary',
            label: 'Deskripsi dan persyaratan',
            type: 'textarea',
        },
        { key: 'deadline', label: 'Tenggat', type: 'date' },
        { key: 'source_url', label: 'Tautan resmi', type: 'url' },
        {
            key: 'accepts_applications',
            label: 'Terima pendaftaran langsung melalui SkillBridge Connect',
            type: 'checkbox',
        },
    ];
    const label =
        [...nav, ...accountNav].find((item) => item.key === section)?.label ??
        'Ringkasan';
    const select = (key: string) => {
        if (![...nav, ...accountNav].find((item) => item.key === key)?.href)
            router.get(
                route.url({
                    query: { section: key, organization: organization?.id },
                }),
            );
    };
    return (
        <DashboardLayout
            nav={nav.map((item) => ({ ...item, badge: undefined }))}
            accountNav={accountNav}
            active={section}
            onSelect={select}
            tour={company ? 'perusahaan' : 'mitra'}
            searchPlaceholder="Cari program dan pendaftar"
        >
            <Head title={label} />
            <FlashToast />
            <div className="mx-auto max-w-5xl space-y-5">
                <h1 className="text-2xl font-semibold">{label}</h1>
                {portal.organizations.length > 0 && (
                    <label className="block text-sm">
                        Organisasi aktif
                        <select
                            className="mt-1 block rounded-xl border border-black/10 bg-white px-3 py-2"
                            value={organization?.id}
                            onChange={(e) =>
                                router.get(
                                    route.url({
                                        query: {
                                            section,
                                            organization: e.target.value,
                                        },
                                    }),
                                )
                            }
                        >
                            {portal.organizations.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                {!organization ? (
                    <>
                        <p className="text-sm text-black/50">
                            Daftarkan organisasi untuk mengelola program dan
                            tim. Admin akan meninjau identitas organisasi.
                        </p>
                        <OrganizationRegistration />
                    </>
                ) : (
                    <>
                        <p className="text-sm text-black/50">
                            {organization.name} · Verifikasi{' '}
                            {organization.status} · Akses{' '}
                            {
                                {
                                    owner: 'Pemilik',
                                    editor: 'Pengelola program',
                                    reviewer: 'Peninjau pendaftar',
                                }[permission ?? '']
                            }
                        </p>
                        {['organization', 'company'].includes(section) &&
                            (permission === 'owner' ? (
                                <DataForm
                                    title="Profil organisasi"
                                    action={update(organization.id)}
                                    initial={{
                                        name: organization.name,
                                        email: organization.email,
                                        website: organization.website ?? '',
                                        description:
                                            organization.description ?? '',
                                    }}
                                    fields={[
                                        {
                                            key: 'name',
                                            label: 'Nama organisasi',
                                        },
                                        {
                                            key: 'email',
                                            label: 'Email',
                                            type: 'email',
                                        },
                                        {
                                            key: 'website',
                                            label: 'Situs resmi',
                                            type: 'url',
                                        },
                                        {
                                            key: 'description',
                                            label: 'Deskripsi',
                                            type: 'textarea',
                                        },
                                    ]}
                                />
                            ) : (
                                <p className="rounded-2xl bg-white p-5 text-sm">
                                    {organization.description}
                                </p>
                            ))}
                        {section === 'team' && (
                            <>
                                <div className="space-y-3 rounded-2xl bg-white p-5">
                                    {portal.members.data.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-wrap items-center justify-between gap-2 text-sm"
                                        >
                                            <span>
                                                {item.name} · {item.email} ·{' '}
                                                {
                                                    {
                                                        owner: 'Pemilik',
                                                        editor: 'Pengelola program',
                                                        reviewer:
                                                            'Peninjau pendaftar',
                                                    }[item.permission]
                                                }
                                            </span>
                                            {permission === 'owner' &&
                                                item.permission !== 'owner' && (
                                                    <button
                                                        className="text-cta"
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    'Cabut akses anggota ini?',
                                                                )
                                                            )
                                                                router.delete(
                                                                    removeMember.url(
                                                                        {
                                                                            organization:
                                                                                organization.id,
                                                                            member: item.id,
                                                                        },
                                                                    ),
                                                                );
                                                        }}
                                                    >
                                                        Cabut akses
                                                    </button>
                                                )}
                                        </div>
                                    ))}
                                    <Pagination
                                        paginator={portal.members}
                                        only={['portal']}
                                    />
                                </div>
                                {permission === 'owner' && (
                                    <DataForm
                                        title="Tambah anggota yang sudah memiliki akun"
                                        action={member(organization.id)}
                                        fields={[
                                            {
                                                key: 'email',
                                                label: 'Email akun',
                                                type: 'email',
                                            },
                                            {
                                                key: 'permission',
                                                label: 'Hak akses',
                                                type: 'select',
                                                options: [
                                                    {
                                                        value: 'editor',
                                                        label: 'Pengelola program',
                                                    },
                                                    {
                                                        value: 'reviewer',
                                                        label: 'Peninjau pendaftar',
                                                    },
                                                ],
                                            },
                                        ]}
                                    />
                                )}
                            </>
                        )}
                        {['overview', 'performance'].includes(section) && (
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl bg-white p-5">
                                    <p className="text-sm text-black/50">
                                        Program
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold">
                                        {portal.programs.total}
                                    </p>
                                </div>
                                {Object.entries(portal.counts).map(
                                    ([stage, count]) => (
                                        <div
                                            className="rounded-2xl bg-white p-5"
                                            key={stage}
                                        >
                                            <p className="text-sm text-black/50">
                                                {stage}
                                            </p>
                                            <p className="mt-2 text-3xl font-semibold">
                                                {count}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                        {['overview', 'programs', 'jobs'].includes(section) && (
                            <>
                                <div className="space-y-3">
                                    {portal.programs.data.map((item) => (
                                        <article
                                            key={item.id}
                                            className="rounded-2xl bg-white p-5"
                                        >
                                            <h2 className="font-semibold">
                                                {item.title}
                                            </h2>
                                            <p className="mt-1 text-xs text-brand">
                                                {item.type} · {item.status}
                                            </p>
                                            <p className="mt-2 text-sm text-black/60">
                                                {item.summary}
                                            </p>
                                            {['owner', 'editor'].includes(
                                                permission ?? '',
                                            ) &&
                                                organization.status ===
                                                    'disetujui' && (
                                                    <details className="mt-4">
                                                        <summary className="cursor-pointer text-sm text-brand">
                                                            Kelola program
                                                        </summary>
                                                        <DataForm
                                                            key={
                                                                item.id +
                                                                item.status
                                                            }
                                                            action={programUpdate(
                                                                {
                                                                    organization:
                                                                        organization.id,
                                                                    opportunity:
                                                                        item.id,
                                                                },
                                                            )}
                                                            fields={
                                                                programFields
                                                            }
                                                            initial={{
                                                                title: item.title,
                                                                category_id:
                                                                    item.category_id
                                                                        ? String(
                                                                              item.category_id,
                                                                          )
                                                                        : '',
                                                                level:
                                                                    item.details
                                                                        ?.jenjang ??
                                                                    item.details
                                                                        ?.level ??
                                                                    '',
                                                                location:
                                                                    item.details
                                                                        ?.lokasi ??
                                                                    '',
                                                                duration:
                                                                    item.details
                                                                        ?.durasi ??
                                                                    '',
                                                                work_type:
                                                                    item.details
                                                                        ?.tipe_kerja ??
                                                                    '',
                                                                requirements:
                                                                    item.details
                                                                        ?.persyaratan ??
                                                                    '',
                                                                type: item.type,
                                                                summary:
                                                                    item.summary,
                                                                deadline:
                                                                    item.deadline?.slice(
                                                                        0,
                                                                        10,
                                                                    ) ?? '',
                                                                source_url:
                                                                    item.source_url,
                                                                accepts_applications:
                                                                    item.accepts_applications,
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="mt-3 text-sm text-cta"
                                                            onClick={() => {
                                                                if (
                                                                    window.confirm(
                                                                        'Tutup pendaftaran program ini?',
                                                                    )
                                                                )
                                                                    router.patch(
                                                                        programClose.url(
                                                                            {
                                                                                organization:
                                                                                    organization.id,
                                                                                opportunity:
                                                                                    item.id,
                                                                            },
                                                                        ),
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    );
                                                            }}
                                                        >
                                                            Tutup pendaftaran
                                                        </button>
                                                    </details>
                                                )}
                                            {item.type === 'kelas' &&
                                                ['owner', 'editor'].includes(
                                                    permission ?? '',
                                                ) && (
                                                    <DataForm
                                                        title="Tambah materi kelas"
                                                        action={lesson({
                                                            organization:
                                                                organization.id,
                                                            opportunity:
                                                                item.id,
                                                        })}
                                                        fields={[
                                                            {
                                                                key: 'title',
                                                                label: 'Judul materi',
                                                            },
                                                            {
                                                                key: 'source_url',
                                                                label: 'Tautan materi',
                                                                type: 'url',
                                                            },
                                                            {
                                                                key: 'description',
                                                                label: 'Penjelasan materi',
                                                                type: 'textarea',
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            {item.review_note && (
                                                <p className="mt-2 text-sm text-cta">
                                                    Catatan admin:{' '}
                                                    {item.review_note}
                                                </p>
                                            )}
                                        </article>
                                    ))}
                                    {!portal.programs.data.length && (
                                        <p className="rounded-2xl bg-white p-5 text-sm text-black/50">
                                            Belum ada program.
                                        </p>
                                    )}
                                    <Pagination
                                        paginator={portal.programs}
                                        only={['portal']}
                                    />
                                </div>
                                {['owner', 'editor'].includes(
                                    permission ?? '',
                                ) &&
                                    organization.status === 'disetujui' && (
                                        <DataForm
                                            title={
                                                company
                                                    ? 'Ajukan lowongan'
                                                    : 'Ajukan program'
                                            }
                                            action={program(organization.id)}
                                            fields={programFields}
                                        />
                                    )}
                            </>
                        )}
                        {['applicants', 'candidates', 'interviews'].includes(
                            section,
                        ) && (
                            <>
                                {portal.applications.data
                                    .filter(
                                        (item) =>
                                            section !== 'interviews' ||
                                            item.interview_at,
                                    )
                                    .map((item) => (
                                        <article
                                            key={item.id}
                                            className="space-y-3 rounded-2xl bg-white p-5"
                                        >
                                            <h2 className="font-semibold">
                                                {item.name} · {item.title}
                                            </h2>
                                            <p className="text-sm text-black/50">
                                                {item.email} · {item.stage}
                                            </p>
                                            <p className="text-sm">
                                                {item.message}
                                            </p>
                                            {item.portfolio_url &&
                                                /^https?:\/\//i.test(
                                                    item.portfolio_url,
                                                ) && (
                                                    <a
                                                        className="inline-block text-sm text-brand"
                                                        href={
                                                            item.portfolio_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Lihat portofolio
                                                    </a>
                                                )}
                                            {['owner', 'reviewer'].includes(
                                                permission ?? '',
                                            ) && (
                                                <DataForm
                                                    action={candidate({
                                                        organization:
                                                            organization.id,
                                                        application: item.id,
                                                    })}
                                                    initial={{
                                                        stage: item.stage,
                                                        interview_at:
                                                            item.interview_at ??
                                                            '',
                                                        interview_location:
                                                            item.interview_location ??
                                                            '',
                                                    }}
                                                    fields={[
                                                        {
                                                            key: 'stage',
                                                            label: 'Tahap',
                                                            type: 'select',
                                                            options: [
                                                                'baru',
                                                                'ditinjau',
                                                                'wawancara',
                                                                'diterima',
                                                                'ditolak',
                                                            ].map((value) => ({
                                                                value,
                                                                label: value,
                                                            })),
                                                        },
                                                        {
                                                            key: 'interview_at',
                                                            label: 'Jadwal wawancara',
                                                            type: 'datetime-local',
                                                        },
                                                        {
                                                            key: 'interview_location',
                                                            label: 'Lokasi atau tautan wawancara',
                                                        },
                                                    ]}
                                                />
                                            )}
                                        </article>
                                    ))}
                                {!portal.applications.data.length && (
                                    <p className="rounded-2xl bg-white p-5 text-sm text-black/50">
                                        Belum ada pendaftaran langsung.
                                    </p>
                                )}
                                <Pagination
                                    paginator={portal.applications}
                                    only={['portal']}
                                />
                            </>
                        )}
                        {section === 'settings' && (
                            <p className="rounded-2xl bg-white p-5 text-sm">
                                Pengaturan akun dapat dibuka melalui menu akun.
                            </p>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
