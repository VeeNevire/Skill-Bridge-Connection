<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Websites (whole domains) that run scholarship, internship or job programs, found by the monthly AI search.
        Schema::create('discovered_sites', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('name');
            // Site origin (scheme + host), so each domain is listed once.
            $table->string('url')->unique();
            $table->text('description')->nullable();
            // Month (YYYY-MM) the site was last found.
            $table->string('period', 7);
            $table->boolean('is_approved')->default(false);
            $table->timestamps();
            $table->index(['type', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discovered_sites');
    }
};
