<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('permission')->default('reviewer');
            $table->timestamps();
            $table->unique(['organization_id', 'user_id']);
            $table->index(['user_id', 'organization_id']);
        });
        Schema::create('organization_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opportunity_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('message');
            $table->string('portfolio_url', 2048)->nullable();
            $table->timestamp('consented_at');
            $table->string('stage')->default('baru');
            $table->dateTime('interview_at')->nullable();
            $table->string('interview_location')->nullable();
            $table->timestamps();
            $table->unique(['opportunity_id', 'user_id']);
            $table->index(['opportunity_id', 'stage']);
            $table->index(['user_id', 'created_at']);
        });
        Schema::table('opportunities', function (Blueprint $table) {
            $table->boolean('accepts_applications')->default(false);
            $table->index(['organization_id', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('opportunities', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'type', 'created_at']);
            $table->dropColumn('accepts_applications');
        });
        Schema::dropIfExists('organization_applications');
        Schema::dropIfExists('organization_members');
    }
};
