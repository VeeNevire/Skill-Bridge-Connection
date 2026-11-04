<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Key/value platform settings, read through a single cached array.
 *
 * @property string $key
 * @property mixed $value
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    public const CACHE_KEY = 'settings.all';

    /** Defaults used until an admin saves a value. */
    public const DEFAULTS = [
        'platform_name' => 'SkillBridge Connect',
        'support_email' => 'bantuan@skillbridge.test',
        'registration_open' => true,
        'require_moderation' => true,
        'announcement' => '',
    ];

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'value' => 'json',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function allValues(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => [
            ...self::DEFAULTS,
            ...self::query()->pluck('value', 'key')->all(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $values
     */
    public static function store(array $values): void
    {
        foreach ($values as $key => $value) {
            self::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        Cache::forget(self::CACHE_KEY);
    }
}
