<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            MuscleSeeder::class,
        ]);

        $adminRoleId = \App\Models\Role::query()->where('slug', 'admin')->value('id');

        User::updateOrCreate(
            ['email' => 'admin@gym.local'],
            [
                'role_id' => $adminRoleId,
                'name' => 'Administrador',
                'password' => Hash::make('password'),
            ]
        );
    }
}
