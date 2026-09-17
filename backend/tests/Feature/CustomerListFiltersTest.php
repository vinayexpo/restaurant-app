<?php

namespace Tests\Feature;

use App\Models\Favourite;
use App\Models\LoyaltyTransaction;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerListFiltersTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_orders_can_be_filtered_by_status_and_are_paginated(): void
    {
        $customer = User::factory()->customer()->create();
        $delivered = Order::factory()->delivered()->create(['user_id' => $customer->id]);
        Order::factory()->cancelled()->create(['user_id' => $customer->id]);

        $this->actingAs($customer)
            ->getJson('/api/orders?status=delivered')
            ->assertOk()
            ->assertJsonPath('data.0.id', $delivered->id)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.page', 1);
    }

    public function test_customer_loyalty_transactions_can_be_filtered_by_type(): void
    {
        $customer = User::factory()->customer()->create();
        $earned = LoyaltyTransaction::create([
            'user_id' => $customer->id,
            'type' => 'earned',
            'points' => 20,
            'balance_after' => 20,
            'description' => 'Order points',
        ]);
        LoyaltyTransaction::create([
            'user_id' => $customer->id,
            'type' => 'redeemed',
            'points' => -10,
            'balance_after' => 10,
            'description' => 'Redeemed points',
        ]);

        $this->actingAs($customer)
            ->getJson('/api/loyalty/transactions?type=earned')
            ->assertOk()
            ->assertJsonPath('data.0.id', $earned->id)
            ->assertJsonCount(1, 'data');
    }

    public function test_notifications_can_be_filtered_by_read_status(): void
    {
        $customer = User::factory()->customer()->create();
        $unread = Notification::create([
            'user_id' => $customer->id,
            'title' => 'Unread alert',
            'body' => 'New update',
            'type' => 'system',
        ]);
        Notification::create([
            'user_id' => $customer->id,
            'title' => 'Read alert',
            'body' => 'Older update',
            'type' => 'system',
            'read_at' => now(),
        ]);

        $this->actingAs($customer)
            ->getJson('/api/notifications?read_status=unread')
            ->assertOk()
            ->assertJsonPath('data.0.id', $unread->id)
            ->assertJsonCount(1, 'data');
    }

    public function test_customer_favourites_are_searchable_and_paginated(): void
    {
        $customer = User::factory()->customer()->create();
        $matchingRestaurant = Restaurant::factory()->create(['name' => 'Cedar Kitchen']);
        $otherRestaurant = Restaurant::factory()->create(['name' => 'Maple Cafe']);
        $favourite = Favourite::create(['user_id' => $customer->id, 'restaurant_id' => $matchingRestaurant->id]);
        Favourite::create(['user_id' => $customer->id, 'restaurant_id' => $otherRestaurant->id]);

        $this->actingAs($customer)
            ->getJson('/api/favourites?search=Cedar')
            ->assertOk()
            ->assertJsonPath('data.0.id', $favourite->id)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.total', 1);
    }
}
