<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\AuditLog;
use App\Models\PrivateDocument;
use App\Models\User;
use App\Support\AdminStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', Rule::enum(UserRole::class)],
            'status' => ['nullable', 'in:aktif,ditangguhkan'],
        ]);

        $users = User::query()
            ->select(['id', 'name', 'email', 'suspended_at', 'created_at'])
            ->with('roles:id,name,label')
            ->when($filters['q'] ?? null, function ($query, string $q) {
                // Email prefix uses the unique index; name falls back to a contains match.
                $query->where(fn ($w) => $w->where('email', 'like', "{$q}%")->orWhere('name', 'like', "%{$q}%"));
            })
            ->when($filters['role'] ?? null, fn ($query, string $role) => $query->withRole(UserRole::from($role)))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $status === 'ditangguhkan'
                ? $query->whereNotNull('suspended_at')
                : $query->whereNull('suspended_at'))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $filters,
            'stats' => AdminStats::users(),
            'roles' => AdminStats::roleOptions(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $roles = $request->roles();

        $user = DB::transaction(function () use ($request, $roles) {
            $user = User::query()->create($request->safe()->only(['name', 'email', 'password']));
            // Created by an admin, so the address is treated as confirmed.
            $user->forceFill(['email_verified_at' => now()])->save();
            $user->syncRoles($roles);

            return $user;
        });

        $labels = implode(', ', array_map(fn (UserRole $r) => $r->label(), $roles));
        AuditLog::record($request->user(), 'user.created', "menambah pengguna {$user->name} ({$labels})", $user, [
            'roles' => array_map(fn (UserRole $r) => $r->value, $roles),
        ]);
        AdminStats::flush();

        return back()->with('success', "Pengguna {$user->name} ditambahkan.");
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $admin = $request->user();

        if ($request->hasAny(['name', 'email'])) {
            $user->fill($request->safe()->only(['name', 'email']));
            $changed = array_keys($user->getDirty());

            if ($changed !== []) {
                $user->save();
                AuditLog::record($admin, 'user.updated', "mengubah data akun {$user->name}", $user, ['fields' => $changed]);
            }
        }

        if ($request->has('roles')) {
            $roles = $request->roles();
            $user->syncRoles($roles);
            $labels = implode(', ', array_map(fn (UserRole $r) => $r->label(), $roles));

            AuditLog::record($admin, 'user.role', "mengatur peran {$user->name}: {$labels}", $user, [
                'roles' => array_map(fn (UserRole $r) => $r->value, $roles),
            ]);
        }

        if ($request->has('suspended')) {
            $suspended = $request->boolean('suspended');
            $user->forceFill(['suspended_at' => $suspended ? now() : null])->save();
            AuditLog::record($admin, $suspended ? 'user.suspend' : 'user.restore', ($suspended ? 'menangguhkan akun ' : 'memulihkan akun ').$user->name, $user);
        }

        AdminStats::flush();

        return back()->with('success', 'Data pengguna diperbarui.');
    }

    /**
     * Permanently delete an account (e.g. a privacy deletion request), including its stored files.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403);

        // An organization must never be left without an owner.
        $soleOwnerOf = DB::table('organization_members as m')
            ->join('organizations as o', 'o.id', '=', 'm.organization_id')
            ->where('m.user_id', $user->id)
            ->where('m.permission', 'owner')
            ->whereNotExists(fn ($q) => $q->selectRaw('1')->from('organization_members as other')
                ->whereColumn('other.organization_id', 'm.organization_id')
                ->where('other.permission', 'owner')
                ->where('other.user_id', '!=', $user->id))
            ->pluck('o.name');

        if ($soleOwnerOf->isNotEmpty()) {
            throw ValidationException::withMessages([
                'user' => "{$user->name} adalah satu-satunya pemilik {$soleOwnerOf->implode(', ')}. Tambahkan pemilik lain sebelum menghapus akun ini.",
            ]);
        }

        $paths = PrivateDocument::query()->where('user_id', $user->id)->pluck('path')->all();
        $name = $user->name;
        $email = $user->email;

        DB::transaction(function () use ($user, $request, $name, $email) {
            $user->delete();
            AuditLog::record($request->user(), 'user.deleted', "menghapus akun {$name} ({$email})", null, ['user_id' => $user->id]);
        });

        // Files are removed only after the database delete succeeded.
        Storage::disk('local')->delete($paths);
        AdminStats::flush();

        return back()->with('success', "Akun {$name} dihapus permanen.");
    }
}
