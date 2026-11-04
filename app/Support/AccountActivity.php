<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AccountActivity
{
    public static function completion(?User $user): int
    {
        if (! $user) {
            return 0;
        }
        $profile = DB::table('talent_profiles')->where('user_id', $user->id)->first(['bio', 'portfolio_url']);
        $parts = [! empty($user->name) && ! empty($user->email), ! empty($profile->bio), ! empty($profile->portfolio_url), DB::table('educations')->where('user_id', $user->id)->exists(), DB::table('talent_skills')->where('user_id', $user->id)->exists(), DB::table('experiences')->where('user_id', $user->id)->exists()];

        return (int) round(count(array_filter($parts)) / count($parts) * 100);
    }

    /** @return list<array{title: string, time: string, href: string}> */
    public static function items(?User $user): array
    {
        if (! $user) {
            return [];
        }
        $items = [];
        $tasks = DB::table('application_tasks as t')->join('applications as a', 'a.id', '=', 't.application_id')->where('a.user_id', $user->id)->where('t.completed', false)->whereNotNull('t.due_date')->where('t.due_date', '<=', now()->addDays(7)->toDateString())->orderBy('t.due_date')->limit(5)->get(['t.title', 't.due_date']);
        foreach ($tasks as $task) {
            $items[] = ['title' => 'Tenggat tugas: '.$task->title, 'time' => $task->due_date, 'href' => route('applications.index')];
        }
        $sessions = DB::table('mentoring_requests')->where(fn ($q) => $q->where('participant_id', $user->id)->orWhere('mentor_id', $user->id))->where('updated_at', '>=', now()->subDays(7))->latest('updated_at')->limit(5)->get(['topic', 'status', 'updated_at', 'mentor_id']);
        $user->loadMissing('roles:id,name,label');
        foreach ($sessions as $session) {
            $items[] = ['title' => 'Sesi '.$session->topic.': '.$session->status, 'time' => $session->updated_at, 'href' => route($session->mentor_id === $user->id && $user->hasRole(UserRole::Mentor) ? 'mentor.dashboard' : 'mentoring.index')];
        }
        $applications = DB::table('organization_applications as a')->join('opportunities as o', 'o.id', '=', 'a.opportunity_id')->where('a.user_id', $user->id)->latest('a.updated_at')->limit(5)->get(['o.title', 'a.stage', 'a.updated_at']);
        foreach ($applications as $application) {
            $items[] = ['title' => $application->title.': '.$application->stage, 'time' => $application->updated_at, 'href' => route('applications.index')];
        }

        return array_slice($items, 0, 10);
    }
}
