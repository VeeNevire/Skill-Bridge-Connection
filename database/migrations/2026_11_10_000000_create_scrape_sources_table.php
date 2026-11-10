<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scrape_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type');
            // With a URL, listings are read straight from that page's HTML (JSON-LD, headings, links).
            // Without one, the AI searches the web using `keywords`.
            $table->string('url', 500)->nullable();
            $table->string('keywords', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->string('last_status')->nullable();
            $table->text('last_error')->nullable();
            $table->unsignedInteger('last_count')->default(0);
            $table->timestamps();
        });

        Schema::table('opportunities', function (Blueprint $table) {
            $table->foreignId('scrape_source_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unique(['scrape_source_id', 'source_url']);
        });
    }

    public function down(): void
    {
        Schema::table('opportunities', function (Blueprint $table) {
            // MySQL needs the foreign key gone before the unique index it leans on.
            $table->dropForeign(['scrape_source_id']);
            $table->dropUnique(['scrape_source_id', 'source_url']);
            $table->dropColumn('scrape_source_id');
        });
        Schema::dropIfExists('scrape_sources');
    }
};
