import { Head } from '@inertiajs/react';
import { ParticipantLayout } from '@/components/dashboard/participant-layout';
import { PrivateDocuments } from '@/components/dashboard/private-documents';
import type { PrivateDocument } from '@/components/dashboard/private-documents';
import { DataForm } from '@/components/dashboard/data-form';
import { CursorPagination } from '@/components/admin/ui';
import { draft } from '@/routes/workspace';
import type { Paginated, CursorPaginated } from '@/types';
export default function Workspace({
    application,
    documents,
    drafts,
}: {
    application: { id: number; opportunity: { title: string } };
    documents: Paginated<PrivateDocument>;
    drafts: CursorPaginated<{ id: number; body: string; created_at: string }>;
}) {
    return (
        <ParticipantLayout active="studio">
            <Head title="Ruang kerja aplikasi" />
            <div className="mx-auto max-w-4xl space-y-5">
                <h1 className="text-2xl font-semibold">
                    {application.opportunity.title}
                </h1>
                <PrivateDocuments
                    documents={documents}
                    applicationId={application.id}
                />
                <DataForm
                    title="Draft esai atau motivation letter"
                    action={draft(application.id)}
                    initial={{ body: drafts.data[0]?.body ?? '' }}
                    button="Simpan versi draft"
                    fields={[
                        { key: 'body', label: 'Isi draft', type: 'textarea' },
                    ]}
                />
                <section className="space-y-3 rounded-2xl bg-white p-5">
                    <h2 className="font-semibold">Riwayat versi draft</h2>
                    {drafts.data.map((item) => (
                        <details
                            key={item.id}
                            className="rounded-xl border border-black/5 p-3"
                        >
                            <summary className="cursor-pointer text-sm">
                                Versi {item.id} ·{' '}
                                {new Date(item.created_at).toLocaleString(
                                    'id-ID',
                                )}
                            </summary>
                            <p className="mt-3 text-sm whitespace-pre-wrap text-black/65">
                                {item.body}
                            </p>
                        </details>
                    ))}
                    <CursorPagination paginator={drafts} only={['drafts']} />
                </section>
            </div>
        </ParticipantLayout>
    );
}
