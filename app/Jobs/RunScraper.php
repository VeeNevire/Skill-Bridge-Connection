<?php

namespace App\Jobs;

use App\Enums\ReviewStatus;
use App\Models\Opportunity;
use App\Models\ScrapeSource;
use App\Services\HermesClient;
use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Collects listings for one source: from its page's HTML when it has a URL, otherwise from an AI web search.
 */
class RunScraper implements ShouldQueue
{
    use Queueable;

    public const MAX_ITEMS = 50;

    // AI searches can take minutes; keep the worker from killing the job early.
    public int $timeout = 600;

    public function __construct(public ScrapeSource $source) {}

    public function handle(HermesClient $hermes): void
    {
        try {
            $items = self::scrape($this->source, $hermes);
            foreach ($items as $item) {
                $opportunity = Opportunity::query()->updateOrCreate(
                    ['scrape_source_id' => $this->source->id, 'source_url' => $item['url']],
                    [
                        'type' => $this->source->type,
                        'title' => $item['title'],
                        'summary' => $item['summary'],
                        'deadline' => $item['deadline'],
                        'details' => array_filter(['penyelenggara' => $item['organizer']]) ?: null,
                        'accepts_applications' => false,
                    ],
                );
                // Listings come from admin-curated sources, so they skip the moderation queue.
                $opportunity->forceFill(['status' => ReviewStatus::Approved])->save();
            }
            $this->source->forceFill(['last_status' => 'berhasil', 'last_error' => null, 'last_count' => count($items)]);
        } catch (Throwable $e) {
            $this->source->forceFill(['last_status' => 'gagal', 'last_error' => str($e->getMessage())->limit(1000)->toString(), 'last_count' => 0]);
        }
        $this->source->forceFill(['last_run_at' => now()])->save();
    }

    /**
     * Fetch listings without saving them.
     *
     * @return list<array{title: string, url: string, summary: string|null, deadline: string|null, organizer: string|null}>
     */
    public static function scrape(ScrapeSource $source, HermesClient $hermes): array
    {
        if (! $source->url) {
            return array_slice(self::clean($hermes->discover($source->type->label(), $source->keywords)), 0, self::MAX_ITEMS);
        }

        $html = Http::timeout(20)->withUserAgent('Mozilla/5.0 (compatible; SkillBridgeBot/1.0)')->get($source->url)->throw()->body();

        return self::parse($html, $source->url);
    }

    /**
     * Read listings straight from HTML: JSON-LD first, then linked headings, then long content links.
     *
     * @return list<array{title: string, url: string, summary: string|null, deadline: string|null, organizer: string|null}>
     */
    public static function parse(string $html, string $baseUrl): array
    {
        $dom = new DOMDocument;
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8">'.$html);
        libxml_clear_errors();
        $xpath = new DOMXPath($dom);

        $items = self::jsonLd($xpath, $baseUrl);
        // Page chrome (menus, footers, sidebars) is never a listing.
        $outsideChrome = 'not(ancestor::nav or ancestor::header or ancestor::footer or ancestor::aside or ancestor::*[@role="navigation"])';
        // Each heading is a listing title; its link is inside the heading or elsewhere on the same card.
        foreach ($xpath->query("//*[self::h2 or self::h3 or self::h4][{$outsideChrome}] | //a[@href][.//h2 or .//h3 or .//h4][{$outsideChrome}]") ?: [] as $node) {
            if ($node instanceof DOMElement) {
                $items[] = self::fromHeading($node, $baseUrl);
            }
        }
        if (count(self::clean($items)) < 3) {
            $host = self::host($baseUrl);
            foreach ($xpath->query("//body//a[@href][{$outsideChrome}]") ?: [] as $link) {
                if ($link instanceof DOMElement && self::host((string) self::absoluteUrl($link->getAttribute('href'), $baseUrl)) === $host) {
                    $title = self::text($link);
                    $items[] = [...self::fromCard($link, $title), 'title' => mb_strlen($title) >= 25 ? $title : null, 'url' => self::absoluteUrl($link->getAttribute('href'), $baseUrl)];
                }
            }
        }

        return array_slice(self::clean($items), 0, self::MAX_ITEMS);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function jsonLd(DOMXPath $xpath, string $baseUrl): array
    {
        $items = [];
        foreach ($xpath->query('//script[@type="application/ld+json"]') ?: [] as $script) {
            if (! $script instanceof DOMElement) {
                continue;
            }
            $data = json_decode($script->textContent, true);
            $stack = is_array($data) ? [$data] : [];
            while ($node = array_pop($stack)) {
                array_push($stack, ...array_values(array_filter($node, 'is_array')));
                $type = (array) ($node['@type'] ?? []);
                if (array_intersect($type, ['JobPosting', 'Event', 'Course', 'EducationalOccupationalProgram', 'Grant'])) {
                    $items[] = [
                        'title' => $node['title'] ?? $node['name'] ?? null,
                        'url' => self::absoluteUrl((string) ($node['url'] ?? ''), $baseUrl),
                        'summary' => is_string($node['description'] ?? null) ? strip_tags($node['description']) : null,
                        'deadline' => self::date((string) ($node['validThrough'] ?? $node['applicationDeadline'] ?? $node['endDate'] ?? '')),
                        'organizer' => data_get($node, 'hiringOrganization.name') ?? data_get($node, 'organizer.name') ?? data_get($node, 'provider.name'),
                    ];
                }
            }
        }

        return $items;
    }

    /**
     * @return array<string, mixed>
     */
    private static function fromHeading(DOMElement $node, string $baseUrl): array
    {
        $title = self::text($node);
        $link = $node->nodeName === 'a' ? $node : $node->getElementsByTagName('a')->item(0);
        $card = self::card($node);
        // Card layouts often put the title in a plain heading and the link on a "detail" button.
        $link ??= $card !== $node ? $card->getElementsByTagName('a')->item(0) : null;

        return [
            ...self::fromCard($node, $title),
            'title' => mb_strlen($title) >= 8 ? $title : null,
            'url' => $link ? self::absoluteUrl($link->getAttribute('href'), $baseUrl) : null,
        ];
    }

    /** The nearest block wrapping one listing: an article, list item, table row, or a small div. */
    private static function card(DOMElement $node): DOMElement
    {
        $card = $node;
        while ($card->parentNode instanceof DOMElement && ! in_array($card->nodeName, ['article', 'li', 'tr'], true) && mb_strlen(self::text($card->parentNode)) < 800) {
            $card = $card->parentNode;
        }

        return $card;
    }

    /**
     * Summary, deadline and organizer read from the card around a listing title.
     *
     * @return array<string, mixed>
     */
    private static function fromCard(DOMElement $node, string $title): array
    {
        $card = self::card($node);
        $summary = null;
        foreach ($card->getElementsByTagName('p') as $p) {
            $text = self::text($p);
            if (mb_strlen($text) >= 30 && $text !== $title) {
                $summary = $text;
                break;
            }
        }
        $organizer = null;
        foreach ($card->getElementsByTagName('*') as $el) {
            if (preg_match('/penyelenggara|organi[sz]er|company|perusahaan|provider|instansi/i', $el->getAttribute('class'))) {
                $organizer = trim(preg_replace('/^[^\p{L}\p{N}]+/u', '', self::text($el)) ?? '') ?: null;
                break;
            }
        }

        return ['summary' => $summary, 'deadline' => self::deadline(self::text($card)), 'organizer' => $organizer];
    }

    private static function host(string $url): string
    {
        return preg_replace('/^www\./', '', (string) parse_url($url, PHP_URL_HOST)) ?? '';
    }

    /**
     * Drop incomplete rows and duplicate URLs, and trim fields to column sizes.
     *
     * @param  array<int, mixed>  $items
     * @return list<array{title: string, url: string, summary: string|null, deadline: string|null, organizer: string|null}>
     */
    public static function clean(array $items): array
    {
        $clean = [];
        foreach ($items as $item) {
            $title = is_array($item) && is_string($item['title'] ?? null) ? trim($item['title']) : '';
            $url = is_array($item) && is_string($item['url'] ?? null) ? trim($item['url']) : '';
            // source_url is a 255-char column; a cut URL would point nowhere, so skip it instead.
            if ($title === '' || ! preg_match('#^https?://#i', $url) || strlen($url) > 255 || isset($clean[$url])) {
                continue;
            }
            $summary = is_string($item['summary'] ?? null) ? trim($item['summary']) : '';
            $organizer = is_string($item['organizer'] ?? null) ? trim($item['organizer']) : '';
            $clean[$url] = [
                'title' => str($title)->limit(250)->toString(),
                'url' => $url,
                'summary' => $summary !== '' ? str($summary)->limit(1000)->toString() : null,
                'deadline' => is_string($item['deadline'] ?? null) ? self::date($item['deadline']) : null,
                'organizer' => $organizer !== '' ? str($organizer)->limit(120)->toString() : null,
            ];
        }

        return array_values($clean);
    }

    public static function absoluteUrl(string $href, string $base): ?string
    {
        $href = trim($href);
        if ($href === '' || str_starts_with($href, '#') || preg_match('/^(javascript|mailto|tel):/i', $href)) {
            return null;
        }
        if (preg_match('#^https?://#i', $href)) {
            return $href;
        }
        $parts = parse_url($base);
        $scheme = $parts['scheme'] ?? 'https';
        if (str_starts_with($href, '//')) {
            return $scheme.':'.$href;
        }
        $origin = $scheme.'://'.($parts['host'] ?? '').(isset($parts['port']) ? ':'.$parts['port'] : '');
        if (str_starts_with($href, '/')) {
            return $origin.$href;
        }

        return $origin.(preg_replace('#/[^/]*$#', '/', $parts['path'] ?? '/') ?: '/').$href;
    }

    private static function text(DOMNode $node): string
    {
        return trim(preg_replace('/\s+/u', ' ', $node->textContent) ?? '');
    }

    private const MONTHS = 'jan(?:uari|uary)?|feb(?:ruari|ruary)?|mar(?:et|ch)?|apr(?:il)?|mei|may|jun(?:i|e)?|jul(?:i|y)?|agu(?:stus)?|aug(?:ust)?|sep(?:tember)?|okt(?:ober)?|oct(?:ober)?|nov(?:ember)?|des(?:ember)?|dec(?:ember)?';

    /** Only a date next to a deadline word counts, so post dates are not mistaken for deadlines. */
    public static function deadline(string $text): ?string
    {
        $date = '(\d{4}-\d{2}-\d{2}|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}|\d{1,2}\s+(?:'.self::MONTHS.')\s+\d{4})';
        if (preg_match('/(?:deadline|batas|tenggat|ditutup|closing|close|berakhir|hingga|sampai|until)[^0-9]{0,40}'.$date.'/iu', $text, $m)) {
            return self::date($m[1]);
        }

        return null;
    }

    private static function date(string $value): ?string
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }
        // Indonesian month names are common on local sites; translate them so Carbon can parse.
        $value = preg_replace_callback('/\b('.self::MONTHS.')\b/iu', fn ($m) => [
            'mei' => 'may', 'agu' => 'aug', 'agustus' => 'august', 'okt' => 'oct', 'oktober' => 'october', 'des' => 'dec', 'desember' => 'december',
            'januari' => 'january', 'februari' => 'february', 'maret' => 'march', 'juni' => 'june', 'juli' => 'july',
        ][mb_strtolower($m[1])] ?? $m[1], $value) ?? $value;
        // dd/mm/yyyy is the local convention; Carbon would read it as mm/dd.
        $value = preg_replace('#^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$#', '$3-$2-$1', $value) ?? $value;
        try {
            return Carbon::parse($value)->toDateString();
        } catch (Throwable) {
            return null;
        }
    }
}
