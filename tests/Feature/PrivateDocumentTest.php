<?php

use App\Models\Application;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

test('private documents and draft history are only accessible by their owner', function () {
    Storage::fake('local');
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $opportunity = Opportunity::factory()->approved()->create();
    $this->actingAs($owner)->post(route('applications.store', $opportunity));
    $application = Application::query()->firstOrFail();
    $this->actingAs($owner)->post(route('documents.store'), ['title' => 'CV Pribadi', 'kind' => 'cv', 'application_id' => $application->id, 'file' => UploadedFile::fake()->create('cv.pdf', 20, 'application/pdf')])->assertSessionHasNoErrors();
    $document = DB::table('private_documents')->first();
    Storage::disk('local')->assertExists($document->path);
    $this->actingAs($owner)->get(route('documents.download', $document->id))->assertDownload('cv.pdf');
    $this->actingAs($other)->get(route('documents.download', $document->id))->assertNotFound();
    $this->actingAs($other)->delete(route('documents.destroy', $document->id))->assertNotFound();
    $this->actingAs($other)->post(route('documents.store'), ['title' => 'Berkas', 'kind' => 'cv', 'application_id' => $application->id, 'file' => UploadedFile::fake()->create('cv.pdf', 20, 'application/pdf')])->assertNotFound();
    $this->actingAs($owner)->post(route('workspace.draft', $application), ['body' => 'Draft pertama'])->assertSessionHasNoErrors();
    $this->actingAs($owner)->post(route('workspace.draft', $application), ['body' => 'Draft kedua'])->assertSessionHasNoErrors();
    expect(DB::table('application_draft_versions')->where('application_id', $application->id)->count())->toBe(2);
    $this->actingAs($other)->get(route('workspace.show', $application))->assertNotFound();
    $this->actingAs($other)->post(route('workspace.draft', $application), ['body' => 'Bocor'])->assertNotFound();
    $this->actingAs($owner)->delete(route('applications.destroy', $application))->assertRedirect();
    Storage::disk('local')->assertMissing($document->path);
});

test('document uploads reject unsupported files', function () {
    $this->actingAs(User::factory()->create())->post(route('documents.store'), ['title' => 'Berkas', 'kind' => 'cv', 'file' => UploadedFile::fake()->create('script.php', 1, 'text/plain')])->assertSessionHasErrors('file');
});
