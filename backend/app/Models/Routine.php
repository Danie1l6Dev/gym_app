<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use App\Models\User;

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

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $inner) use ($user): void {
            $inner->where('is_predefined', true)
                ->orWhere('user_id', $user->id);
        });
    }
}
