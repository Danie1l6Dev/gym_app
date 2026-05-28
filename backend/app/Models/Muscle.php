<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Muscle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_es',
        'slug',
    ];

    protected $appends = [
        'display_name',
    ];

    public function exercises(): HasMany
    {
        return $this->hasMany(Exercise::class);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name_es ?: $this->name_en;
    }
}
