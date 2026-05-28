<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $userRoleId = Role::query()->firstOrCreate(
            ['slug' => 'user'],
            [
                'name' => 'Usuario',
                'description' => 'Rol base para usuarios del sistema.',
            ]
        )->id;

        return [
            'role_id' => $userRoleId,
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'phone' => fake()->optional()->numerify('##########'),
            'birth_date' => fake()->optional()->date(),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'height' => fake()->optional()->randomFloat(2, 140, 210),
            'weight' => fake()->optional()->randomFloat(2, 45, 150),
            'profile_photo' => null,
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
