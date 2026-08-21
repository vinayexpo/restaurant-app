<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 150, 1500);
        $deliveryFee = fake()->randomElement([20, 30, 40]);
        $discount = fake()->boolean(30) ? round($subtotal * 0.1, 2) : 0;
        $tax = round($subtotal * 0.05, 2);
        $total = round($subtotal + $deliveryFee + $tax - $discount, 2);

        return [
            'order_number' => 'ORD-'.fake()->unique()->numerify('########'),
            'user_id' => User::factory(),
            'restaurant_id' => Restaurant::factory(),
            'delivery_address_id' => Address::factory(),
            'status' => fake()->randomElement([
                'pending', 'confirmed', 'preparing', 'ready_for_pickup',
                'picked_up', 'on_the_way', 'delivered', 'cancelled',
            ]),
            'payment_status' => 'paid',
            'payment_method' => fake()->randomElement(['cod', 'razorpay']),
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'discount_amount' => $discount,
            'tax_amount' => $tax,
            'total_amount' => $total,
        ];
    }

    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'delivered_at' => now()->subDays(fake()->numberBetween(1, 30)),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => now()->subDays(fake()->numberBetween(1, 30)),
            'cancel_reason' => fake()->sentence(),
        ]);
    }
}
