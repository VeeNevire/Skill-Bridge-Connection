<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentor_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('starts_at');
            $table->unsignedSmallInteger('duration')->default(60);
            $table->timestamps();
            $table->unique(['mentor_id', 'starts_at']);
            $table->index('starts_at');
        });
        Schema::create('mentoring_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('mentor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('availability_id')->nullable()->unique()->constrained('mentor_availability')->nullOnDelete();
            $table->string('topic');
            $table->text('goal');
            $table->dateTime('starts_at');
            $table->string('status')->default('menunggu');
            $table->text('shared_note')->nullable();
            $table->text('private_note')->nullable();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();
            $table->index(['mentor_id', 'status', 'starts_at']);
            $table->index(['participant_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentoring_requests');
        Schema::dropIfExists('mentor_availability');
    }
};
