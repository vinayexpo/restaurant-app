<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SUPERADMIN_EMAIL', 'superadmin@restaurantapp.local');
        $password = env('SUPERADMIN_PASSWORD');

        if (! $password) {
            $this->command?->warn('SUPERADMIN_PASSWORD not set in .env — skipping superadmin seed.');

            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Superadmin',
                'password' => Hash::make($password),
                'role' => 'superadmin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
