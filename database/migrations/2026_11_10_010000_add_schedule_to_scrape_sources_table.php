<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scrape_sources', function (Blueprint $table) {
            // harian | menit | mingguan; null falls back to daily at 03:00.
            $table->string('schedule')->nullable()->after('is_active');
            $table->unsignedSmallInteger('schedule_every')->nullable()->after('schedule');
            $table->string('schedule_time', 5)->nullable()->after('schedule_every');
            // The per-minute scheduler dispatches every active source whose next_run_at has passed.
            $table->timestamp('next_run_at')->nullable()->index()->after('schedule_time');
        });
    }

    public function down(): void
    {
        Schema::table('scrape_sources', function (Blueprint $table) {
            $table->dropIndex(['next_run_at']);
            $table->dropColumn(['schedule', 'schedule_every', 'schedule_time', 'next_run_at']);
        });
    }
};
