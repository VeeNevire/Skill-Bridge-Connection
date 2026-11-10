<?php

namespace App\Http\Controllers;

use App\Enums\ReviewStatus;
use App\Models\Opportunity;
use App\Models\ScrapeSource;
use App\Services\HermesClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use RuntimeException;

class OpportunityAssistantController extends Controller
{
    private const TYPES = ['beasiswa', 'magang', 'lowongan'];

    public function __invoke(Request $request, HermesClient $hermes): JsonResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:1000'],
            'type' => ['nullable', Rule::in(self::TYPES)],
        ], ['question.required' => 'Pertanyaan wajib diisi.', 'question.max' => 'Pertanyaan terlalu panjang.']);
        $types = isset($data['type']) ? [$data['type']] : self::TYPES;

        $base = Opportunity::query()
            ->with('scrapeSource:id,name')
            // Admin-managed listings: scraped plus hand-entered.
            ->whereNull('organization_id')
            ->whereIn('type', $types)
            ->where('status', ReviewStatus::Approved)
            ->where(fn ($q) => $q->whereNull('deadline')->orWhereDate('deadline', '>=', today()));
        // ponytail: keyword LIKE match, swap for embeddings if the catalogue grows past a few thousand rows.
        $words = collect(preg_split('/\W+/u', mb_strtolower($data['question'])) ?: [])->filter(fn ($w) => mb_strlen($w) >= 4)->take(8);
        $matched = (clone $base)->when($words->isNotEmpty(), fn ($q) => $q->where(fn ($q) => $words->each(fn ($w) => $q->orWhere('title', 'like', "%{$w}%")->orWhere('summary', 'like', "%{$w}%"))))->latest('id')->limit(40)->get();
        $items = $matched->isNotEmpty() ? $matched : $base->latest('id')->limit(40)->get();

        $context = $items->map(fn (Opportunity $o) => '- ['.$o->type->label().'] '.$o->title
            .($o->deadline ? ' | tenggat '.$o->deadline->toDateString() : '')
            .' | penyelenggara '.($o->details['penyelenggara'] ?? $o->scrapeSource->name ?? '-')
            .' | '.($o->source_url ?? route('catalog.show', $o))
            .($o->summary ? "\n  ".str($o->summary)->limit(300) : ''))->implode("\n");
        $sources = ScrapeSource::query()->where('is_active', true)->whereNotNull('url')->whereIn('type', $types)->get(['name', 'url', 'type'])
            ->map(fn (ScrapeSource $s) => "- {$s->name} ({$s->type->label()}): {$s->url}")->implode("\n");

        $prompt = <<<PROMPT
        Kamu asisten SkillBridge Connect yang membantu peserta mencari beasiswa, magang, dan karier.
        Jawab dalam Bahasa Indonesia, ringkas dan jelas, hanya berdasarkan DATA di bawah.
        Sertakan judul dan link sumber untuk setiap peluang yang kamu sebut.
        Jika data tidak cukup, katakan terus terang dan sarankan website sumber yang relevan.
        Jawab dalam teks biasa, bukan JSON.

        WEBSITE SUMBER:
        {$sources}

        DATA PELUANG:
        {$context}

        PERTANYAAN:
        {$data['question']}
        PROMPT;

        try {
            return response()->json(['answer' => $hermes->ask($prompt)]);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }
}
