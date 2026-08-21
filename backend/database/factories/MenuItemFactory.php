<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    public function definition(): array
    {
        $isVeg = fake()->boolean(60);
        $name = fake()->randomElement($isVeg
            ? ['Paneer Tikka', 'Veg Biryani', 'Margherita Pizza', 'Dal Makhani', 'Veg Spring Roll', 'Aloo Paratha']
            : ['Chicken Biryani', 'Butter Chicken', 'Chicken Wings', 'Mutton Curry', 'Fish Fry', 'Egg Roll']
        ).' '.fake()->numberBetween(1, 999);
        $price = fake()->randomFloat(2, 99, 599);

        return [
            'restaurant_id' => Restaurant::factory(),
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(6),
            'description' => fake()->sentence(),
            'price' => $price,
            'discounted_price' => fake()->boolean(30) ? round($price * 0.85, 2) : null,
            'is_veg' => $isVeg,
            'is_available' => true,
            'is_featured' => fake()->boolean(15),
            'preparation_time' => fake()->numberBetween(10, 40),
            'calories' => fake()->numberBetween(150, 900),
            'tags' => fake()->randomElements(['bestseller', 'spicy', 'new'], fake()->numberBetween(0, 2)),
        ];
    }
}
