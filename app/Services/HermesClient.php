<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Minimal client for the Hermes gateway (trimmed from the news-portal client): start a run, poll until it ends.
 */
class HermesClient
{
    public function ask(string $prompt): string
    {
        try {
            $output = $this->run($prompt);
        } catch (Throwable $e) {
            // The raw error stays in the log; users only see the friendly message.
            Log::warning('Hermes: '.$e->getMessage());
            throw new RuntimeException($this->friendlyError($e->getMessage()), 0, $e);
        }

        if (is_string($output)) {
            return $output;
        }
        $text = data_get($output, 'answer') ?? data_get($output, 'output') ?? data_get($output, 'text');

        return is_string($text) ? $text : json_encode($output, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
    }

    /**
     * Ask the agent to search the web for open listings and return them as rows.
     *
     * @return list<mixed>
     */
    public function discover(string $typeLabel, ?string $keywords): array
    {
        $today = now()->toDateString();
        $focus = $keywords ? "Fokus pencarian: {$keywords}." : 'Fokus pada peluang untuk pelajar, mahasiswa, dan lulusan baru di Indonesia.';
        $prompt = <<<PROMPT
        Cari di internet informasi {$typeLabel} yang masih buka pendaftarannya (hari ini {$today}).
        {$focus}
        Ambil hanya dari sumber terpercaya dan sertakan URL halaman detail aslinya (bukan halaman pencarian).
        Kembalikan HANYA JSON valid tanpa teks lain, maksimal 10 item, dengan format:
        {"items":[{"title":"...","url":"https://...","summary":"ringkasan 1-2 kalimat","deadline":"YYYY-MM-DD atau null","organizer":"penyelenggara atau null"}]}
        PROMPT;

        try {
            // Web search is slow (~1 min per few items); stays under the job's 600s timeout.
            $output = $this->run($prompt, 540);
        } catch (Throwable $e) {
            // The raw error stays in the log; users only see the friendly message.
            Log::warning('Hermes: '.$e->getMessage());
            throw new RuntimeException($this->friendlyError($e->getMessage()), 0, $e);
        }

        return $this->items($output, 'Jawaban AI bukan daftar peluang yang valid.');
    }

    /**
     * Ask the agent for websites that regularly publish one type of opportunity.
     *
     * @return list<mixed>
     */
    public function discoverSites(string $typeLabel): array
    {
        $prompt = <<<PROMPT
        Cari di internet website resmi dan terpercaya yang rutin membuka atau mempublikasikan program {$typeLabel} untuk pelajar, mahasiswa, dan lulusan baru di Indonesia.
        Utamakan situs penyelenggara asli (pemerintah, kampus, yayasan, perusahaan) dan portal agregator yang kredibel.
        Kembalikan HANYA JSON valid tanpa teks lain, maksimal 20 item, dengan format:
        {"items":[{"name":"nama website/penyelenggara","url":"https://domain-utama","description":"1 kalimat tentang program yang ditawarkan"}]}
        PROMPT;

        try {
            $output = $this->run($prompt, 540);
        } catch (Throwable $e) {
            Log::warning('Hermes: '.$e->getMessage());
            throw new RuntimeException($this->friendlyError($e->getMessage()), 0, $e);
        }

        return $this->items($output, 'Jawaban AI bukan daftar website yang valid.');
    }

    /**
     * Pull the `items` list out of an agent reply, which may be an array or JSON wrapped in prose.
     *
     * @return list<mixed>
     */
    private function items(mixed $output, string $error): array
    {
        if (is_array($output) && is_string($output['output'] ?? null)) {
            $output = $output['output'];
        }
        if (is_string($output)) {
            // Agents often wrap JSON in prose or ``` fences; keep the outermost object.
            $start = strpos($output, '{');
            $end = strrpos($output, '}');
            $output = $start !== false && $end !== false ? json_decode(substr($output, $start, $end - $start + 1), true) : null;
        }
        $items = is_array($output) ? ($output['items'] ?? null) : null;
        if (! is_array($items)) {
            throw new RuntimeException($error);
        }

        return array_values($items);
    }

    private function request(): PendingRequest
    {
        $request = Http::baseUrl(rtrim((string) config('hermes.base_url'), '/'))
            ->acceptJson()
            ->connectTimeout((int) config('hermes.connect_timeout', 10))
            ->timeout((int) config('hermes.timeout', 90));

        return config('hermes.token') ? $request->withToken((string) config('hermes.token')) : $request;
    }

    private function run(string $input, ?int $runTimeout = null): mixed
    {
        $endpoint = (string) config('hermes.endpoints.runs', '/runs');
        $response = $this->request()->post($endpoint, [
            'input' => $input,
            'session_id' => 'skillbridge-assistant-'.now()->format('YmdHis').'-'.bin2hex(random_bytes(4)),
        ]);
        if ($response->failed()) {
            throw new RuntimeException('Hermes Runs gagal (HTTP '.$response->status().'): '.str($response->body())->limit(500));
        }

        $run = $response->json();
        $runId = $run['run_id'] ?? $run['id'] ?? null;
        if (! $runId) {
            return $run['output'] ?? $run;
        }

        $deadline = microtime(true) + ($runTimeout ?? (int) config('hermes.run_timeout', 120));
        do {
            $result = $this->request()->get($endpoint.'/'.$runId);
            if ($result->failed()) {
                throw new RuntimeException('Hermes polling gagal (HTTP '.$result->status().'): '.str($result->body())->limit(500));
            }
            $data = $result->json();
            $status = strtolower((string) ($data['status'] ?? ''));
            if (in_array($status, ['completed', 'complete', 'succeeded', 'success'], true)) {
                return $data['output'] ?? $data;
            }
            if (in_array($status, ['failed', 'error', 'cancelled', 'stopped'], true)) {
                throw new RuntimeException('Hermes run berstatus '.$status.': '.str((string) ($data['error'] ?? $data['message'] ?? 'tanpa detail'))->limit(400));
            }
            sleep((int) config('hermes.poll_seconds', 2));
        } while (microtime(true) < $deadline);

        throw new RuntimeException('Hermes run timeout.');
    }

    private function friendlyError(string $message): string
    {
        $m = strtolower($message);

        return match (true) {
            str_contains($m, 'could not resolve') || str_contains($m, 'connection refused') || str_contains($m, 'curl error 7') => 'Asisten AI tidak dapat dihubungi. Pastikan tunnel Hermes aktif.',
            str_contains($m, 'timeout') || str_contains($m, 'timed out') => 'Asisten AI terlalu lama merespons. Coba lagi sebentar lagi.',
            str_contains($m, 'http 401') || str_contains($m, 'unauthorized') => 'Autentikasi Hermes ditolak. Periksa HERMES_TOKEN.',
            str_contains($m, 'http 429') || str_contains($m, 'rate limit') => 'Batas permintaan AI tercapai. Tunggu sebentar lalu coba lagi.',
            str_contains($m, 'quota') || str_contains($m, 'credit') || str_contains($m, 'billing') => 'Kredit provider AI habis.',
            default => 'Asisten AI sedang bermasalah. Coba lagi nanti.',
        };
    }
}
