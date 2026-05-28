<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Administrador',
                'slug' => 'admin',
                'description' => 'Acceso completo a administracion y sincronizacion. Puede usar funciones administrativas y del usuario final.',
            ],
            [
                'name' => 'Usuario',
                'slug' => 'user',
                'description' => 'Acceso al catalogo, rutinas y funciones del usuario final.',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }
    }
}
