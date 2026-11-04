<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (Schema::getForeignKeys('applications') as $foreignKey) {
            if ($foreignKey['foreign_table'] === 'opportunities' && $foreignKey['columns'] === ['opportunity_id']) {
                return;
            }
        }
        Schema::table('applications', fn (Blueprint $table) => $table->foreign('opportunity_id')->references('id')->on('opportunities')->cascadeOnDelete());
    }

    public function down(): void
    {
        // Remove the FK before the earlier opportunities migration is rolled back.
        Schema::table('applications', fn (Blueprint $table) => $table->dropForeign(['opportunity_id']));
    }
};
