<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Cursor pagination keeps every page equally fast however large the log grows (no OFFSET scans).
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'action' => ['nullable', 'string', 'max:50'],
        ]);

        $logs = AuditLog::query()
            ->select(['id', 'user_id', 'action', 'description', 'created_at'])
            ->with('user:id,name')
            ->when($filters['action'] ?? null, fn ($q, string $action) => $q->where('action', 'like', "{$action}.%"))
            ->orderByDesc('id')
            ->cursorPaginate(20)
            ->withQueryString();

        return Inertia::render('admin/audit-logs/index', [
            'logs' => $logs,
            'filters' => $filters,
            'actions' => [
                ['value' => 'opportunity', 'label' => 'Moderasi'],
                ['value' => 'organization', 'label' => 'Verifikasi mitra'],
                ['value' => 'mentor', 'label' => 'Verifikasi mentor'],
                ['value' => 'report', 'label' => 'Laporan'],
                ['value' => 'user', 'label' => 'Pengguna'],
                ['value' => 'category', 'label' => 'Kategori'],
                ['value' => 'settings', 'label' => 'Pengaturan'],
            ],
        ]);
    }
}
