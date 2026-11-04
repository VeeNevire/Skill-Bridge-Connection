<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\ApplicationTask;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ApplicationTaskController extends Controller
{
    public function store(Request $request, Application $application): RedirectResponse
    {
        abort_unless($application->getAttribute('user_id') === $request->user()->id, 404);
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'due_date' => ['nullable', 'date']], ['title.required' => 'Nama tugas wajib diisi.', 'title.max' => 'Nama tugas maksimal 255 karakter.', 'due_date.date' => 'Tanggal tenggat tidak valid.']);
        $application->tasks()->create($data);

        return back()->with('success', 'Tugas ditambahkan.');
    }

    public function update(Request $request, Application $application, ApplicationTask $task): RedirectResponse
    {
        abort_unless($application->getAttribute('user_id') === $request->user()->id && $task->getAttribute('application_id') === $application->id, 404);
        $data = $request->validate(['completed' => ['required', 'boolean']]);
        $task->update($data);

        return back();
    }

    public function destroy(Request $request, Application $application, ApplicationTask $task): RedirectResponse
    {
        abort_unless($application->getAttribute('user_id') === $request->user()->id && $task->getAttribute('application_id') === $application->id, 404);
        $task->delete();

        return back();
    }
}
