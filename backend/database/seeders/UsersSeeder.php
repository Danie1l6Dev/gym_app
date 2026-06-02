<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $adminRoleId = Role::query()->where('slug', 'admin')->value('id');
        $userRoleId = Role::query()->where('slug', 'user')->value('id');

        $users = [
            [
                'role_id' => $adminRoleId,
                'name' => 'Admin GymApp',
                'username' => 'admingym',
                'email' => 'admin@gymapp.com',
                'gender' => 'other',
                'phone' => '3005550001',
                'birth_date' => '1990-02-14',
                'height' => 178.00,
                'weight' => 82.50,
            ],
            [
                'role_id' => $userRoleId,
                'name' => 'Daniel Sierra',
                'username' => 'danielsierra',
                'email' => 'user1@gymapp.com',
                'gender' => 'male',
                'phone' => '3005550002',
                'birth_date' => '1995-08-21',
                'height' => 180.00,
                'weight' => 84.20,
            ],
            [
                'role_id' => $userRoleId,
                'name' => 'Maria Marquez',
                'username' => 'mariamarquez',
                'email' => 'user2@gymapp.com',
                'gender' => 'female',
                'phone' => '3005550003',
                'birth_date' => '1998-11-03',
                'height' => 165.00,
                'weight' => 61.80,
            ],
            [
                'role_id' => $userRoleId,
                'name' => 'Carlos Alvarez',
                'username' => 'carlosalvarez',
                'email' => 'user3@gymapp.com',
                'gender' => 'male',
                'phone' => '3005550004',
                'birth_date' => '1992-05-10',
                'height' => 174.00,
                'weight' => 79.30,
            ],
            [
                'role_id' => $userRoleId,
                'name' => 'Renzo Sanchez',
                'username' => 'renzosanchez',
                'email' => 'user4@gymapp.com',
                'gender' => 'male',
                'phone' => '3005550005',
                'birth_date' => '2000-01-28',
                'height' => 168.00,
                'weight' => 59.40,
            ],
            [
                'role_id' => $userRoleId,
                'name' => 'Deiner Florian',
                'username' => 'deinerflorian',
                'email' => 'user5@gymapp.com',
                'gender' => 'male',
                'phone' => '3005550006',
                'birth_date' => '1989-09-17',
                'height' => 182.00,
                'weight' => 88.10,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'profile_photo' => null,
                    'is_active' => true,
                    'remember_token' => Str::random(10),
                ])
            );
        }
    }
}
