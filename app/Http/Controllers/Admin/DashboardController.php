<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ContentReport;
use App\Models\MentorProfile;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\User;
use App\Support\AdminStats;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Admin overview: cached aggregates plus small, index-backed "latest" lists.
     */
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'userStats' => AdminStats::users(),
            'signups' => AdminStats::signups(),
            'pendingOpportunities' => Opportunity::query()
                ->pending()
                ->with('organization:id,name')
                ->latest()
                ->limit(5)
                ->get(['id', 'type', 'title', 'organization_id', 'created_at']),
            'pendingOrganizations' => Organization::query()
                ->pending()
                ->latest()
                ->limit(3)
                ->get(['id', 'name', 'type', 'created_at']),
            'pendingMentors' => MentorProfile::query()
                ->pending()
                ->with('user:id,name')
                ->latest()
                ->limit(3)
                ->get(['id', 'user_id', 'expertise', 'years_experience', 'created_at']),
            'openReports' => ContentReport::query()
                ->where('status', ReportStatus::Open)
                ->with('opportunity:id,title')
                ->latest()
                ->limit(3)
                ->get(['id', 'opportunity_id', 'reason', 'severity', 'created_at']),
            'recentActivity' => AuditLog::query()
                ->with('user:id,name')
                ->latest('id')
                ->limit(6)
                ->get(['id', 'user_id', 'action', 'description', 'created_at']),
            'latestUsers' => User::query()
                ->with('roles:id,name,label')
                ->latest()
                ->limit(5)
                ->get(['id', 'name', 'email', 'suspended_at', 'created_at']),
        ]);
    }
}
