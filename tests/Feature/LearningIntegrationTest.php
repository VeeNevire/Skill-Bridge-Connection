<?php

use App\Enums\OpportunityType;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('class enrollment and learning progress are private and feed dashboard totals', function () {
    $participant = User::factory()->create();
    $other = User::factory()->create();
    $course = Opportunity::factory()->approved()->create(['type' => OpportunityType::Course]);
    $lesson = DB::table('course_lessons')->insertGetId(['opportunity_id' => $course->id, 'title' => 'Materi pertama', 'source_url' => 'https://example.com/materi']);
    $this->actingAs($participant)->post(route('learning.enroll', $course))->assertRedirect(route('learning.show', $course));
    $this->actingAs($participant)->patch(route('learning.progress', [$course, $lesson]), ['completed' => true])->assertSessionHasNoErrors();
    $this->actingAs($participant)->get(route('learning.show', $course))->assertInertia(fn (Assert $page) => $page->where('completed.0', $lesson));
    $this->actingAs($participant)->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page->where('overview.courses', 1));
    $this->actingAs($other)->get(route('learning.show', $course))->assertNotFound();
    $this->actingAs($other)->patch(route('learning.progress', [$course, $lesson]), ['completed' => true])->assertNotFound();
    $another = Opportunity::factory()->approved()->create(['type' => OpportunityType::Course]);
    $this->actingAs($participant)->post(route('learning.enroll', $another));
    $this->actingAs($participant)->patch(route('learning.progress', [$another, $lesson]), ['completed' => true])->assertNotFound();
});
