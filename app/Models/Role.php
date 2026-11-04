<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Cache;

/**
 * @property int $id
 * @property UserRole $name
 * @property string $label
 */
#[Hidden(['pivot', 'created_at', 'updated_at'])]
class Role extends Model
{
    protected function casts(): array
    {
        return [
            'name' => UserRole::class,
        ];
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles');
    }

    /**
     * Role ids keyed by name. Roles are fixed reference data, so this is cached.
     *
     * @return array<string, int>
     */
    public static function ids(): array
    {
        return Cache::rememberForever('roles.ids', fn () => self::query()->pluck('id', 'name')->all());
    }

    public static function idFor(UserRole $role): int
    {
        return self::ids()[$role->value];
    }
}
