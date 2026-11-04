<?php

namespace App\Models;

use App\Enums\ReportSeverity;
use App\Enums\ReportStatus;
use Database\Factories\ContentReportFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $opportunity_id
 * @property string $reason
 * @property ReportSeverity $severity
 * @property ReportStatus $status
 */
#[Fillable(['opportunity_id', 'reason', 'details', 'severity'])]
class ContentReport extends Model
{
    /** @use HasFactory<ContentReportFactory> */
    use HasFactory;

    protected $attributes = [
        'status' => 'terbuka',
    ];

    protected function casts(): array
    {
        return [
            'severity' => ReportSeverity::class,
            'status' => ReportStatus::class,
            'handled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Opportunity, $this>
     */
    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function handle(User $admin, ReportStatus $status, ?string $note = null): void
    {
        $this->forceFill([
            'status' => $status,
            'handled_by' => $admin->id,
            'handled_at' => now(),
            'resolution_note' => $note,
        ])->save();
    }
}
