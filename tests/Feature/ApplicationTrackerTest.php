<?php

use App\Models\Application;
use App\Models\Opportunity;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('participants save opportunities and manage their personal tracker', function () {
    $user = User::factory()->create();
    $opportunity = Opportunity::factory()->approved()->create();
    $this->actingAs($user)->post(route('applications.store', $opportunity))->assertRedirect(route('applications.index'));
    $this->actingAs($user)->post(route('applications.store', $opportunity))->assertRedirect();
    expect(Application::query()->where('user_id', $user->id)->count())->toBe(1);
    $application = Application::query()->firstOrFail();
    $this->actingAs($user)->patch(route('applications.update', $application), ['status' => 'persiapan', 'notes' => 'Siapkan esai'])->assertRedirect();
    $this->actingAs($user)->post(route('application-tasks.store', $application), ['title' => 'Tulis esai', 'due_date' => '2027-01-01'])->assertRedirect();
    $task = $application->tasks()->firstOrFail();
    $this->actingAs($user)->patch(route('application-tasks.update', [$application, $task]), ['completed' => true])->assertRedirect();
    $this->assertDatabaseHas('application_tasks', ['id' => $task->id, 'completed' => true]);
    $this->actingAs($user)->get(route('applications.index'))->assertInertia(fn (Assert $page) => $page->component('applications/index')->where('applications.data.0.notes', 'Siapkan esai')->has('applications.data.0.tasks', 1));
    $this->actingAs($user)->delete(route('applications.destroy', $application))->assertRedirect();
    $this->assertDatabaseMissing('application_tasks', ['id' => $task->id]);
});

test('tracker rejects access to another participant data', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $opportunity = Opportunity::factory()->approved()->create();
    $this->actingAs($owner)->post(route('applications.store', $opportunity));
    $application = Application::query()->firstOrFail();
    $this->actingAs($owner)->post(route('application-tasks.store', $application), ['title' => 'Rahasia']);
    $task = $application->tasks()->firstOrFail();
    $this->actingAs($other)->patch(route('applications.update', $application), ['status' => 'diterima'])->assertNotFound();
    $this->actingAs($other)->delete(route('applications.destroy', $application))->assertNotFound();
    $this->actingAs($other)->post(route('application-tasks.store', $application), ['title' => 'Lain'])->assertNotFound();
    $this->actingAs($other)->patch(route('application-tasks.update', [$application, $task]), ['completed' => true])->assertNotFound();
    $this->actingAs($other)->delete(route('application-tasks.destroy', [$application, $task]))->assertNotFound();
});

test('unapproved or expired opportunities cannot be saved', function () {
    $user = User::factory()->create();
    $pending = Opportunity::factory()->create();
    $expired = Opportunity::factory()->approved()->create(['deadline' => now()->subDay()]);
    $this->actingAs($user)->post(route('applications.store', $pending))->assertNotFound();
    $this->actingAs($user)->post(route('applications.store', $expired))->assertNotFound();
});
