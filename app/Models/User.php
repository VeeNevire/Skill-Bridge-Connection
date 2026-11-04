<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $suspended_at
 * @property list<string>|null $completed_tours
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Role> $roles
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'suspended_at' => 'datetime',
            'completed_tours' => 'array',
        ];
    }

    /**
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function hasRole(UserRole $role): bool
    {
        return $this->roles->contains(fn (Role $r) => $r->name === $role);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::Admin);
    }

    /**
     * The dashboard this user lands on: their highest-priority role.
     */
    public function homeRoute(): string
    {
        foreach (UserRole::priority() as $role) {
            if ($this->hasRole($role)) {
                return $role->homeRoute();
            }
        }

        return UserRole::Participant->homeRoute();
    }

    /**
     * @param  list<UserRole>  $roles
     */
    public function syncRoles(array $roles): void
    {
        $this->roles()->sync(array_map(fn (UserRole $role) => Role::idFor($role), $roles));
        $this->unsetRelation('roles');
    }

    public function assignRole(UserRole $role): void
    {
        $this->roles()->syncWithoutDetaching([Role::idFor($role)]);
        $this->unsetRelation('roles');
    }

    /**
     * @param  Builder<User>  $query
     */
    public function scopeWithRole(Builder $query, UserRole $role): void
    {
        $query->whereHas('roles', fn (Builder $q) => $q->whereKey(Role::idFor($role)));
    }

    public function isSuspended(): bool
    {
        return $this->suspended_at !== null;
    }

    /**
     * @return HasOne<MentorProfile, $this>
     */
    public function mentorProfile(): HasOne
    {
        return $this->hasOne(MentorProfile::class);
    }
}
