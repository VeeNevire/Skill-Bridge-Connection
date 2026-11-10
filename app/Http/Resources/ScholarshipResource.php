<?php

namespace App\Http\Resources;

use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Opportunity */
class ScholarshipResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'summary' => $this->summary,
            'details' => $this->details,
            'deadline' => $this->deadline?->toDateString(),
            'source_url' => $this->source_url,
            'organizer' => $this->organization->name ?? $this->details['penyelenggara'] ?? $this->scrapeSource->name ?? null,
            'source' => $this->scrapeSource ? [
                'id' => $this->scrapeSource->id,
                'name' => $this->scrapeSource->name,
                'url' => $this->scrapeSource->url,
                'last_run_at' => $this->scrapeSource->last_run_at?->toIso8601String(),
            ] : null,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
