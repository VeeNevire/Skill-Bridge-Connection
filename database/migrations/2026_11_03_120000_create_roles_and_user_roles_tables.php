<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Replace the single users.role column with the blueprint's roles + user_roles tables,
 * so one account can hold several roles. Existing role values are carried over.
 */
return new class extends Migration
{
    private const ROLES = [
        'admin' => 'Super Admin',
        'peserta' => 'Peserta',
        'mentor' => 'Mentor',
        'mitra' => 'Mitra Pendidikan',
        'perusahaan' => 'Perusahaan',
    ];

    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->timestamps();
        });

        Schema::create('user_roles', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['user_id', 'role_id']);
            // "Users with role X" lookups (filters, counts) start from the role side.
            $table->index(['role_id', 'user_id']);
        });

        $now = now();
        DB::table('roles')->insert(array_map(
            fn (string $name, string $label) => ['name' => $name, 'label' => $label, 'created_at' => $now, 'updated_at' => $now],
            array_keys(self::ROLES),
            self::ROLES,
        ));

        $roleIds = DB::table('roles')->pluck('id', 'name');

        DB::table('users')->select(['id', 'role'])->orderBy('id')->chunk(500, function ($users) use ($roleIds) {
            DB::table('user_roles')->insert($users->map(fn ($user) => [
                'user_id' => $user->id,
                'role_id' => $roleIds[$user->role] ?? $roleIds['peserta'],
            ])->all());
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('peserta')->after('email')->index();
        });

        // Keep the most privileged role when collapsing back to a single column.
        foreach (['peserta', 'perusahaan', 'mitra', 'mentor', 'admin'] as $name) {
            $userIds = DB::table('user_roles')
                ->join('roles', 'roles.id', '=', 'user_roles.role_id')
                ->where('roles.name', $name)
                ->pluck('user_roles.user_id');

            DB::table('users')->whereIn('id', $userIds)->update(['role' => in_array($name, ['admin', 'peserta'], true) ? $name : 'peserta']);
        }

        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('roles');
    }
};
