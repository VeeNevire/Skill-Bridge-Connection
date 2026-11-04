<?php

namespace App\Support;

use App\Enums\ReportStatus;
use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Models\ContentReport;
use App\Models\MentorProfile;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Aggregate numbers for the admin panel. Each figure is one indexed query, cached briefly
 * and flushed whenever an admin action changes the underlying data.
 */
class AdminStats
{
    private const TTL = 60;

    private const KEYS = ['admin.badges', 'admin.user-stats', 'admin.analytics', 'admin.analytics.extra'];

    /**
     * Pending counts for the sidebar badges.
     *
     * @return array{verification: int, moderation: int, reports: int}
     */
    public static function badges(): array
    {
        return Cache::remember('admin.badges', self::TTL, fn () => [
            'verification' => Organization::query()->pending()->count() + MentorProfile::query()->pending()->count(),
            'moderation' => Opportunity::query()->pending()->count(),
            'reports' => ContentReport::query()->where('status', ReportStatus::Open)->count(),
        ]);
    }

    /**
     * User totals (one aggregate query) plus head counts per role (one grouped query on user_roles).
     *
     * @return array{total: int, suspended: int, newThisWeek: int, roles: array<string, int>}
     */
    public static function users(): array
    {
        return Cache::remember('admin.user-stats', self::TTL, function () {
            $row = User::query()->toBase()->selectRaw(
                'count(*) as total,
                sum(case when suspended_at is not null then 1 else 0 end) as suspended,
                sum(case when created_at >= ? then 1 else 0 end) as new_this_week',
                [now()->subWeek()],
            )->first();

            $perRole = DB::table('user_roles')
                ->join('roles', 'roles.id', '=', 'user_roles.role_id')
                ->selectRaw('roles.name, count(*) as total')
                ->groupBy('roles.name')
                ->pluck('total', 'name');

            $roles = [];

            foreach (UserRole::cases() as $role) {
                $roles[$role->value] = (int) ($perRole[$role->value] ?? 0);
            }

            return [
                'total' => (int) $row->total,
                'suspended' => (int) $row->suspended,
                'newThisWeek' => (int) $row->new_this_week,
                'roles' => $roles,
            ];
        });
    }

    /**
     * Role options for filters and the role editor.
     *
     * @return list<array{value: string, label: string, description: string}>
     */
    public static function roleOptions(): array
    {
        return array_map(fn (UserRole $r) => ['value' => $r->value, 'label' => $r->label(), 'description' => $r->description()], UserRole::cases());
    }

    /**
     * Daily sign-ups for the last N days, zero-filled, oldest first.
     *
     * @return list<array{date: string, count: int}>
     */
    public static function signups(int $days = 14): array
    {
        return Cache::remember("admin.signups.{$days}", self::TTL, function () use ($days) {
            $start = now()->startOfDay()->subDays($days - 1);

            $counts = User::query()->toBase()
                ->where('created_at', '>=', $start)
                ->selectRaw('date(created_at) as day, count(*) as total')
                ->groupBy('day')
                ->pluck('total', 'day');

            return array_map(function (int $offset) use ($start, $counts) {
                $day = $start->addDays($offset)->toDateString();

                return ['date' => $day, 'count' => (int) ($counts[$day] ?? 0)];
            }, range(0, $days - 1));
        });
    }

    /**
     * Opportunity counts grouped by type and status in one query.
     *
     * @return array<string, array<string, int>>
     */
    public static function opportunityBreakdown(): array
    {
        return Cache::remember('admin.analytics', self::TTL * 10, function () {
            return Opportunity::query()->toBase()
                ->select('type', 'status', DB::raw('count(*) as total'))
                ->groupBy('type', 'status')
                ->get()
                ->groupBy('type')
                ->map(fn ($rows) => $rows->pluck('total', 'status')->map(fn ($n) => (int) $n)->all())
                ->all();
        });
    }

    public static function flush(): void
    {
        foreach (self::KEYS as $key) {
            Cache::forget($key);
        }

        foreach ([14, 30] as $days) {
            Cache::forget("admin.signups.{$days}");
        }
    }

    /**
     * Review status values in display order, for filters.
     *
     * @return list<array{value: string, label: string}>
     */
    public static function reviewStatuses(): array
    {
        return array_map(fn (ReviewStatus $s) => ['value' => $s->value, 'label' => $s->label()], ReviewStatus::cases());
    }
}
