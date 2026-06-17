<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutCheckIn extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'workout_date',
        'completed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'workout_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
