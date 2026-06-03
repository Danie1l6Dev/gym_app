<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            // MusclesSeeder::class,
            UsersSeeder::class,
            // ExercisesSeeder::class,
            MembershipsSeeder::class,
            // RoutinesSeeder::class,
        ]);
    }
}
