<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('discovered_sites', function (Blueprint $table) {
            // The scraper source created when the site is approved.
            $table->foreignId('scrape_source_id')->nullable()->after('is_approved')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('discovered_sites', function (Blueprint $table) {
            $table->dropConstrainedForeignId('scrape_source_id');
        });
    }
};
