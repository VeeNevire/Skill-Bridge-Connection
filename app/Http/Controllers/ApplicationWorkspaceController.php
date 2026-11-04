<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\PrivateDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationWorkspaceController extends Controller
{
    public function show(Request $request, Application $application): Response
    {
        abort_unless($application->getAttribute('user_id') === $request->user()->id, 404);
        $application->load('opportunity:id,title');

        return Inertia::render('applications/workspace', ['application' => $application->only(['id', 'opportunity']), 'documents' => PrivateDocument::query()->where('user_id', $request->user()->id)->where('application_id', $application->id)->latest('id')->paginate(10, ['id', 'title', 'kind', 'original_name'])->withQueryString(), 'drafts' => DB::table('application_draft_versions')->where('application_id', $application->id)->orderByDesc('id')->cursorPaginate(5, ['id', 'body', 'created_at'])->withQueryString()]);
    }

    public function draft(Request $request, Application $application): RedirectResponse
    {
        abort_unless($application->getAttribute('user_id') === $request->user()->id, 404);
        $data = $request->validate(['body' => ['required', 'string', 'max:20000']], ['required' => 'Isi draft wajib diisi.', 'max' => 'Draft maksimal 20000 karakter.']);
        DB::table('application_draft_versions')->insert(['application_id' => $application->id, 'body' => $data['body'], 'created_at' => now(), 'updated_at' => now()]);

        return back()->with('success', 'Versi draft disimpan.');
    }
}
