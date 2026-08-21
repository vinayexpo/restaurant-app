<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Restaurant>
 */
class RestaurantFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company().' '.fake()->randomElement(['Kitchen', 'Restaurant', 'Diner', 'Eatery']);
        $cuisines = fake()->randomElements(
            ['Indian', 'Chinese', 'Pizza', 'Biryani', 'Burgers', 'Desserts', 'Italian', 'Mexican'],
            fake()->numberBetween(1, 3)
        );

        return [
            'user_id' => User::factory()->restaurantOwner(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->paragraph(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->state(),
            'pincode' => fake()->numerify('######'),
            'latitude' => fake()->latitude(8, 37),
            'longitude' => fake()->longitude(68, 97),
            'phone' => fake()->numerify('9#########'),
            'email' => fake()->unique()->companyEmail(),
            'cuisine_types' => $cuisines,
            'opening_time' => '09:00:00',
            'closing_time' => '23:00:00',
            'is_open' => true,
            'min_order_amount' => fake()->randomElement([0, 100, 150, 200]),
            'delivery_fee' => fake()->randomElement([20, 30, 40, 50]),
            'avg_delivery_time' => fake()->numberBetween(20, 60),
            'avg_rating' => fake()->randomFloat(2, 3, 5),
            'total_reviews' => fake()->numberBetween(0, 500),
            'is_active' => true,
            'is_verified' => true,
            'is_featured' => fake()->boolean(20),
            'fssai_number' => fake()->numerify('##############'),
            'gst_number' => fake()->numerify('##AAAAA####A#Z#'),
        ];
    }
}
