<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'muscle_id',
        'source',
        'external_id',
        'name_original',
        'name_es',
        'body_part',
        'target_muscle',
        'secondary_muscles',
        'equipment',
        'gif_url',
        'instructions_original',
        'instructions_es',
        'raw_payload',
        'synced_at',
        // Legacy compatibility fields kept during the migration rollout.
        'name_en',
        'description_en',
        'description_es',
        'source_payload',
    ];

    protected $appends = [
        'display_name',
        'display_description',
    ];

    protected function casts(): array
    {
        return [
            'secondary_muscles' => 'array',
            'equipment' => 'array',
            'instructions_original' => 'array',
            'instructions_es' => 'array',
            'raw_payload' => 'array',
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

    public function scopePublicFilters(Builder $query, array $filters): Builder
    {
        $name = $filters['name'] ?? $filters['nombre'] ?? null;

        return $query
            ->when(isset($filters['muscle_id']), fn (Builder $query) => $query->where('muscle_id', $filters['muscle_id']))
            ->when($name, fn (Builder $query) => $query->where(function (Builder $inner) use ($name): void {
                $inner->where('name_original', 'like', "%{$name}%")
                    ->orWhere('name_en', 'like', "%{$name}%")
                    ->orWhere('name_es', 'like', "%{$name}%");
            }))
            ->when($filters['body_part'] ?? null, fn (Builder $query, string $bodyPart) => $query->where('body_part', $bodyPart))
            ->when($filters['target_muscle'] ?? null, fn (Builder $query, string $targetMuscle) => $query->where('target_muscle', $targetMuscle))
            ->when($filters['equipment'] ?? null, fn (Builder $query, string $equipment) => $query->whereJsonContains('equipment', $equipment))
            ->when($filters['source'] ?? null, fn (Builder $query, string $source) => $query->where('source', $source));
    }

    public function scopeSearchCatalog(Builder $query, ?string $term): Builder
    {
        if (! $term) {
            return $query;
        }

        return $query->where(function (Builder $inner) use ($term): void {
            $inner->where('name_original', 'like', "%{$term}%")
                ->orWhere('name_en', 'like', "%{$term}%")
                ->orWhere('name_es', 'like', "%{$term}%")
                ->orWhere('body_part', 'like', "%{$term}%")
                ->orWhere('target_muscle', 'like', "%{$term}%");
        });
    }

    public function scopeOrderedForCatalog(Builder $query): Builder
    {
        return $query->orderByRaw('COALESCE(name_es, name_original, name_en)')
            ->orderBy('id');
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name_es
            ?: $this->name_original
            ?: $this->name_en
            ?: '';
    }

    public function getDisplayDescriptionAttribute(): ?string
    {
        return $this->normalizeTextValue($this->instructions_es)
            ?? $this->normalizeTextValue($this->instructions_original)
            ?? $this->normalizeTextValue($this->description_es)
            ?? $this->description_en;
    }

    public function translatedName(?string $locale = null): string
    {
        $locale ??= app()->getLocale();

        if ($locale !== 'es') {
            return $this->name_original ?: $this->name_en ?: $this->name_es ?: '';
        }

        return $this->name_es ?: $this->name_original ?: $this->name_en ?: '';
    }

    public function translatedDescription(?string $locale = null): ?string
    {
        $locale ??= app()->getLocale();

        if ($locale !== 'es') {
            return $this->normalizeTextValue($this->instructions_original)
                ?? $this->description_en
                ?? $this->normalizeTextValue($this->instructions_es)
                ?? $this->description_es;
        }

        return $this->normalizeTextValue($this->instructions_es)
            ?? $this->normalizeTextValue($this->instructions_original)
            ?? $this->description_es
            ?? $this->description_en;
    }

    private function normalizeTextValue(mixed $value): ?string
    {
        if (is_string($value)) {
            $trimmed = trim($value);

            return $trimmed !== '' ? $trimmed : null;
        }

        if (! is_array($value)) {
            return null;
        }

        $items = Collection::make($value)
            ->flatten()
            ->filter(fn ($item) => is_string($item) || is_numeric($item))
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->values();

        return $items->isNotEmpty() ? $items->implode(PHP_EOL) : null;
    }

    private function normalizeListValue(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return Collection::make($value)
            ->flatten()
            ->filter(fn ($item) => is_string($item) || is_numeric($item))
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->values()
            ->all();
    }
}
