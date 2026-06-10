<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'duration_days',
        'price',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'duration_days' => 'integer',
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
