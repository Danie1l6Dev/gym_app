<?php

namespace App\Http\Requests\Api\V1\Routine\Concerns;

use App\Models\Day;
use Illuminate\Validation\Validator;

trait ValidatesRoutineDays
{
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->has('days')) {
                return;
            }

            $dayIds = collect($this->input('days', []))
                ->filter(fn ($dayId): bool => $dayId !== null && $dayId !== '')
                ->map(fn ($dayId): int => (int) $dayId)
                ->unique()
                ->values();

            if ($dayIds->isEmpty()) {
                return;
            }

            $slugs = Day::query()
                ->whereIn('id', $dayIds)
                ->pluck('slug')
                ->all();

            $trainingSlugs = collect($slugs)
                ->reject(fn (string $slug): bool => $slug === 'domingo')
                ->values();

            if ($trainingSlugs->count() <= 1) {
                return;
            }

            $allowedPairs = [
                ['lunes', 'jueves'],
                ['martes', 'viernes'],
                ['miercoles', 'sabado'],
            ];

            $selected = $trainingSlugs->sort()->values()->all();

            foreach ($allowedPairs as $pair) {
                if ($selected === collect($pair)->sort()->values()->all()) {
                    return;
                }
            }

            $validator->errors()->add(
                'days',
                'Entre lunes y sabado solo puedes combinar lunes con jueves, martes con viernes o miercoles con sabado. Domingo se puede agregar libremente.'
            );
        });
    }
}
