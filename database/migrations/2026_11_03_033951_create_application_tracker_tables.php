<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Opportunities are created later in a fresh installation. The final FK migration attaches this constraint.
            $table->foreignId('opportunity_id')->index();
            $table->string('status')->default('ingin_daftar');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'opportunity_id']);
            $table->index(['user_id', 'updated_at']);
        });
        Schema::create('application_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->index()->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->boolean('completed')->default(false);
            $table->date('due_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_tasks');
        Schema::dropIfExists('applications');
    }
};
