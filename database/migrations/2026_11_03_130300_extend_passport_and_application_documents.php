<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('talent_profiles', function (Blueprint $table) {
            $table->string('interests', 1000)->nullable();
            $table->string('preferred_location')->nullable();
            $table->string('preferred_level')->nullable();
            $table->string('preferred_opportunity')->nullable();
        });
        Schema::create('private_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('kind');
            $table->string('path');
            $table->string('original_name');
            $table->timestamps();
            $table->index(['user_id', 'application_id', 'id']);
        });
        Schema::create('application_draft_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
            $table->index(['application_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_draft_versions');
        Schema::dropIfExists('private_documents');
        Schema::table('talent_profiles', fn (Blueprint $table) => $table->dropColumn(['interests', 'preferred_location', 'preferred_level', 'preferred_opportunity']));
    }
};
