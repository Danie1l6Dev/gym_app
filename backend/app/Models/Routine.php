<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Routine extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'is_predefined',
    ];

    protected function casts(): array
    {
        return [
            'is_predefined' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exercises(): BelongsToMany
    {
        return $this->belongsToMany(Exercise::class, 'routine_exercises')
            ->withPivot(['position', 'sets', 'reps', 'rest_seconds', 'notes'])
            ->withTimestamps()
            ->orderBy('routine_exercises.position');
    }

    public function routineExercises(): HasMany
    {
        return $this->hasMany(RoutineExercise::class);
    }
}
