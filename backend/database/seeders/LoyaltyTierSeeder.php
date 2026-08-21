<?php

namespace Database\Seeders;

use App\Models\LoyaltyTier;
use Illuminate\Database\Seeder;

class LoyaltyTierSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            [
                'name' => 'Bronze',
                'min_lifetime_points' => 0,
                'points_multiplier' => 1.00,
                'free_delivery' => false,
                'free_delivery_min' => null,
                'badge_color' => '#CD7F32',
                'perks' => ['1x points on every order'],
            ],
            [
                'name' => 'Silver',
                'min_lifetime_points' => 1000,
                'points_multiplier' => 1.25,
                'free_delivery' => true,
                'free_delivery_min' => 300.00,
                'badge_color' => '#C0C0C0',
                'perks' => ['1.25x points', 'Free delivery on orders over ₹300'],
            ],
            [
                'name' => 'Gold',
                'min_lifetime_points' => 5000,
                'points_multiplier' => 1.50,
                'free_delivery' => true,
                'free_delivery_min' => null,
                'badge_color' => '#FFD700',
                'perks' => ['1.5x points', 'Free delivery always', 'Priority support'],
            ],
            [
                'name' => 'Platinum',
                'min_lifetime_points' => 10000,
                'points_multiplier' => 2.00,
                'free_delivery' => true,
                'free_delivery_min' => null,
                'badge_color' => '#E5E4E2',
                'perks' => ['2x points', 'Free delivery always', 'Exclusive offers', 'Birthday bonus 500 pts'],
            ],
        ];

        foreach ($tiers as $tier) {
            LoyaltyTier::updateOrCreate(['name' => $tier['name']], $tier);
        }
    }
}
