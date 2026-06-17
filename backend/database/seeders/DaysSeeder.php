<?php

namespace Database\Seeders;

use App\Models\Day;
use Illuminate\Database\Seeder;

class DaysSeeder extends Seeder
{
    public function run(): void
    {
        $days = [
            ['name' => 'Lunes', 'slug' => 'lunes', 'sort_order' => 1],
            ['name' => 'Martes', 'slug' => 'martes', 'sort_order' => 2],
            ['name' => 'Miercoles', 'slug' => 'miercoles', 'sort_order' => 3],
            ['name' => 'Jueves', 'slug' => 'jueves', 'sort_order' => 4],
            ['name' => 'Viernes', 'slug' => 'viernes', 'sort_order' => 5],
            ['name' => 'Sabado', 'slug' => 'sabado', 'sort_order' => 6],
            ['name' => 'Domingo', 'slug' => 'domingo', 'sort_order' => 7],
        ];

        foreach ($days as $day) {
            Day::query()->updateOrCreate(
                ['slug' => $day['slug']],
                $day
            );
        }
    }
}
