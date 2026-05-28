<?php

namespace Database\Seeders;

use App\Models\Muscle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MusclesSeeder extends Seeder
{
    public function run(): void
    {
        $muscles = [
            ['Chest', 'Pecho'],
            ['Back', 'Espalda'],
            ['Shoulders', 'Hombros'],
            ['Biceps', 'Biceps'],
            ['Triceps', 'Triceps'],
            ['Legs', 'Piernas'],
            ['Glutes', 'Gluteos'],
            ['Abs', 'Abdomen'],
            ['Forearms', 'Antebrazos'],
            ['Calves', 'Pantorrillas'],
        ];

        foreach ($muscles as [$nameEn, $nameEs]) {
            Muscle::updateOrCreate(
                ['slug' => Str::slug($nameEn)],
                [
                    'name_en' => $nameEn,
                    'name_es' => $nameEs,
                ]
            );
        }
    }
}
