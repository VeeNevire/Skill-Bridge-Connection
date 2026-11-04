<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\AuditLog;
use App\Models\PrivateDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PrivateDocumentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'kind' => ['required', 'in:cv,sertifikat,dokumen'], 'application_id' => ['nullable', 'integer'], 'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120']], ['required' => ':attribute wajib diisi.', 'mimes' => 'Unggah PDF, DOC, atau DOCX.', 'max' => 'Berkas maksimal 5 MB dan judul maksimal 255 karakter.', 'in' => 'Jenis dokumen tidak valid.']);
        if (! empty($data['application_id'])) {
            abort_unless(Application::query()->whereKey($data['application_id'])->where('user_id', $request->user()->id)->exists(), 404);
        }
        $file = $request->file('file');
        $path = $file->store('documents/'.$request->user()->id, 'local');
        if ($path === false) {
            throw ValidationException::withMessages(['file' => 'Dokumen gagal disimpan. Coba lagi.']);
        }
        try {
            DB::transaction(function () use ($request, $data, $file, $path) {
                $document = new PrivateDocument;
                $document->forceFill(['user_id' => $request->user()->id, 'application_id' => $data['application_id'] ?? null, 'title' => $data['title'], 'kind' => $data['kind'], 'path' => $path, 'original_name' => basename($file->getClientOriginalName())])->save();
                AuditLog::record($request->user(), 'document.uploaded', 'menyimpan dokumen privat', $document);
            });
        } catch (\Throwable $error) {
            Storage::disk('local')->delete($path);
            throw $error;
        }

        return back()->with('success', 'Dokumen privat disimpan.');
    }

    public function download(Request $request, PrivateDocument $document): StreamedResponse
    {
        abort_unless($document->getAttribute('user_id') === $request->user()->id, 404);

        return Storage::disk('local')->download($document->getAttribute('path'), $document->getAttribute('original_name'));
    }

    public function destroy(Request $request, PrivateDocument $document): RedirectResponse
    {
        abort_unless($document->getAttribute('user_id') === $request->user()->id, 404);
        Storage::disk('local')->delete($document->getAttribute('path'));
        $document->delete();

        return back()->with('success', 'Dokumen dihapus.');
    }
}
