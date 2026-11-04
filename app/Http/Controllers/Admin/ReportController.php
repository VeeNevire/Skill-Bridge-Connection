<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportSeverity;
use App\Enums\ReportStatus;
use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HandleReportRequest;
use App\Models\AuditLog;
use App\Models\ContentReport;
use App\Support\AdminStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(ReportStatus::class)],
            'severity' => ['nullable', Rule::enum(ReportSeverity::class)],
        ]);

        $status = $filters['status'] ?? ReportStatus::Open->value;

        $reports = ContentReport::query()
            ->select(['id', 'opportunity_id', 'reporter_id', 'reason', 'details', 'severity', 'status', 'resolution_note', 'created_at'])
            ->with(['opportunity:id,type,title,status', 'reporter:id,name'])
            ->where('status', $status)
            ->when($filters['severity'] ?? null, fn ($q, string $severity) => $q->where('severity', $severity))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/reports/index', [
            'reports' => $reports,
            'filters' => [...$filters, 'status' => $status],
            'statuses' => array_map(fn (ReportStatus $s) => ['value' => $s->value, 'label' => $s->label()], ReportStatus::cases()),
            'severities' => array_map(fn (ReportSeverity $s) => ['value' => $s->value, 'label' => $s->label()], ReportSeverity::cases()),
        ]);
    }

    public function update(HandleReportRequest $request, ContentReport $report): RedirectResponse
    {
        $admin = $request->user();
        $status = ReportStatus::from($request->validated('status'));
        $report->loadMissing('opportunity:id,title,status');

        DB::transaction(function () use ($admin, $status, $report, $request) {
            $report->handle($admin, $status, $request->validated('note'));

            // Taking the content down rejects it, which removes it from the public catalogue.
            if ($status === ReportStatus::Resolved && $request->boolean('take_down')) {
                $report->opportunity->review($admin, ReviewStatus::Rejected, 'Diturunkan karena laporan: '.$report->reason);
            }
        });

        AuditLog::record(
            $admin,
            'report.'.$status->value,
            ($status === ReportStatus::Resolved ? 'menindak laporan ' : 'mengabaikan laporan ')."\"{$report->opportunity->title}\"",
            $report,
            ['take_down' => $request->boolean('take_down')],
        );
        AdminStats::flush();

        return back()->with('success', 'Laporan '.strtolower($status->label()).'.');
    }
}
