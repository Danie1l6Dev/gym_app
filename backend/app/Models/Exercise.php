<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'muscle_id',
        'source',
        'external_id',
        'name_en',
        'name_es',
        'description_en',
        'description_es',
        'gif_url',
        'source_payload',
        'synced_at',
    ];

    protected $appends = [
        'display_name',
        'display_description',
    ];

    protected function casts(): array
    {
        return [
            'source_payload' => 'array',
            'synced_at' => 'datetime',
        ];
    }

    public function muscle(): BelongsTo
    {
        return $this->belongsTo(Muscle::class);
    }

    public function routines(): BelongsToMany
    {
        return $this->belongsToMany(Routine::class, 'routine_exercises')
            ->withPivot(['position', 'sets', 'reps', 'rest_seconds', 'notes'])
            ->withTimestamps();
    }

    public function routineExercises(): HasMany
    {
        return $this->hasMany(RoutineExercise::class);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name_es ?: $this->name_en;
    }

    public function getDisplayDescriptionAttribute(): ?string
    {
        return $this->description_es ?: $this->description_en;
    }
}
