<?php

namespace Database\Seeders;

use App\Models\Membership;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MembershipsSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        $plans = [
            [
                'email' => 'admin@gymapp.com',
                'plan_type' => 'monthly',
                'status' => 'active',
                'starts_at' => $today->copy()->subDays(10),
                'ends_at' => $today->copy()->addDays(20),
                'price' => 120000,
                'paid_at' => $today->copy()->subDays(10)->setTime(9, 0),
                'notes' => 'Membresia activa del administrador.',
            ],
            [
                'email' => 'user1@gymapp.com',
                'plan_type' => 'weekly',
                'status' => 'active',
                'starts_at' => $today->copy()->subDays(4),
                'ends_at' => $today->copy()->addDays(3),
                'price' => 35000,
                'paid_at' => $today->copy()->subDays(4)->setTime(8, 30),
                'notes' => 'Vence pronto, ideal para mostrar proximos a vencer.',
            ],
            [
                'email' => 'user1@gymapp.com',
                'plan_type' => 'monthly',
                'status' => 'expired',
                'starts_at' => $today->copy()->subDays(45),
                'ends_at' => $today->copy()->subDays(15),
                'price' => 120000,
                'paid_at' => $today->copy()->subDays(45)->setTime(8, 30),
                'notes' => 'Historial de membresia anterior.',
            ],
            [
                'email' => 'user2@gymapp.com',
                'plan_type' => 'monthly',
                'status' => 'active',
                'starts_at' => $today->copy()->subDays(12),
                'ends_at' => $today->copy()->addDays(8),
                'price' => 120000,
                'paid_at' => $today->copy()->subDays(12)->setTime(9, 15),
                'notes' => 'Usuario activo con vencimiento cercano.',
            ],
            [
                'email' => 'user3@gymapp.com',
                'plan_type' => 'weekly',
                'status' => 'expired',
                'starts_at' => $today->copy()->subDays(18),
                'ends_at' => $today->copy()->subDays(11),
                'price' => 35000,
                'paid_at' => $today->copy()->subDays(18)->setTime(10, 0),
                'notes' => 'Membresia expirada.',
            ],
            [
                'email' => 'user4@gymapp.com',
                'plan_type' => 'monthly',
                'status' => 'active',
                'starts_at' => $today->copy()->subDays(3),
                'ends_at' => $today->copy()->addDays(27),
                'price' => 120000,
                'paid_at' => $today->copy()->subDays(3)->setTime(11, 0),
                'notes' => 'Membresia activa sin vencer pronto.',
            ],
            [
                'email' => 'user5@gymapp.com',
                'plan_type' => 'weekly',
                'status' => 'cancelled',
                'starts_at' => $today->copy()->subDays(8),
                'ends_at' => $today->copy()->addDays(1),
                'price' => 35000,
                'paid_at' => $today->copy()->subDays(8)->setTime(12, 0),
                'notes' => 'Membresia cancelada para probar historial.',
            ],
        ];

        foreach ($plans as $plan) {
            $user = User::query()->where('email', $plan['email'])->firstOrFail();

            Membership::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'plan_type' => $plan['plan_type'],
                    'starts_at' => $plan['starts_at']->toDateString(),
                    'ends_at' => $plan['ends_at']->toDateString(),
                ],
                [
                    'status' => $plan['status'],
                    'price' => $plan['price'],
                    'paid_at' => $plan['paid_at'],
                    'notes' => $plan['notes'],
                ]
            );
        }
    }
}
