<?php

namespace App\Models;

use App\Enums\OpportunityType;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A website the scraper reads scholarships, internships or jobs from.
 *
 * @property int $id
 * @property string $name
 * @property OpportunityType $type
 * @property string|null $url
 * @property string|null $keywords
 * @property bool $is_active
 * @property Carbon|null $last_run_at
 * @property string|null $schedule
 * @property int|null $schedule_every
 * @property string|null $schedule_time
 * @property CarbonInterface|null $next_run_at
 */
#[Fillable(['name', 'type', 'url', 'keywords', 'is_active', 'schedule', 'schedule_every', 'schedule_time'])]
class ScrapeSource extends Model
{
    protected function casts(): array
    {
        return [
            'type' => OpportunityType::class,
            'is_active' => 'boolean',
            'last_run_at' => 'datetime',
            'schedule_every' => 'integer',
            'next_run_at' => 'datetime',
        ];
    }

    // ponytail: one fixed admin timezone; make it a setting if admins outside WIB appear.
    public const TIMEZONE = 'Asia/Jakarta';

    protected static function booted(): void
    {
        // Any change to the schedule restarts the countdown from now.
        static::saving(function (ScrapeSource $source) {
            if ($source->isDirty(['schedule', 'schedule_every', 'schedule_time']) || ! $source->next_run_at) {
                $source->next_run_at = $source->firstRunAfter(now());
            }
        });
    }

    /** First run once a schedule is set: the next matching time for daily/weekly, one interval away for minutes. */
    public function firstRunAfter(CarbonInterface $from): CarbonInterface
    {
        return match ($this->schedule) {
            'menit' => $from->copy()->addMinutes($this->schedule_every ?: 60)->startOfMinute(),
            default => $this->nextClockTime($from),
        };
    }

    /** When to run again after a scheduled run started at $from. */
    public function nextRunAfter(CarbonInterface $from): CarbonInterface
    {
        return match ($this->schedule) {
            'menit' => $from->copy()->addMinutes($this->schedule_every ?: 60)->startOfMinute(),
            'mingguan' => $this->nextClockTime($from->copy()->addWeeks($this->schedule_every ?: 1)->subDay()),
            default => $this->nextClockTime($from),
        };
    }

    /** Next moment after $from that the local clock shows schedule_time (default 03:00). */
    private function nextClockTime(CarbonInterface $from): CarbonInterface
    {
        [$hour, $minute] = array_map('intval', explode(':', $this->schedule_time ?: '03:00'));
        $local = $from->copy()->setTimezone(self::TIMEZONE);
        // Reassign every step: the app may use immutable dates.
        $next = $local->copy()->setTime($hour, $minute);
        if ($next->lte($local)) {
            $next = $next->addDay();
        }

        return $next->setTimezone(config('app.timezone'));
    }

    /** Short Indonesian description of the schedule for the admin list. */
    public function scheduleLabel(): string
    {
        $time = $this->schedule_time ?: '03:00';

        return match ($this->schedule) {
            'menit' => 'Setiap '.($this->schedule_every ?: 60).' menit',
            'mingguan' => 'Setiap '.($this->schedule_every ?: 1).' minggu pukul '.$time,
            default => 'Setiap hari pukul '.$time,
        };
    }

    /**
     * @return HasMany<Opportunity, $this>
     */
    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }
}
