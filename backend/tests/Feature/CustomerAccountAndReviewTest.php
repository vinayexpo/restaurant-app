<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerAccountAndReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_update_own_review_and_restaurant_rating_is_recalculated(): void
    {
        $customer = User::factory()->customer()->create();
        $restaurant = Restaurant::factory()->create();
        $order = Order::factory()->delivered()->create([
            'user_id' => $customer->id,
            'restaurant_id' => $restaurant->id,
        ]);
        $review = Review::create([
            'order_id' => $order->id,
            'user_id' => $customer->id,
            'restaurant_id' => $restaurant->id,
            'rating' => 2,
            'comment' => 'Not quite right.',
        ]);

        $this->actingAs($customer, 'sanctum')
            ->putJson("/api/reviews/{$review->id}", ['rating' => 5, 'comment' => 'Much better.'])
            ->assertOk()
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.comment', 'Much better.');

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'rating' => 5]);
        $this->assertDatabaseHas('restaurants', [
            'id' => $restaurant->id,
            'avg_rating' => 5,
            'total_reviews' => 1,
        ]);
    }

    public function test_customer_cannot_change_another_customers_review(): void
    {
        $author = User::factory()->customer()->create();
        $otherCustomer = User::factory()->customer()->create();
        $restaurant = Restaurant::factory()->create();
        $order = Order::factory()->delivered()->create([
            'user_id' => $author->id,
            'restaurant_id' => $restaurant->id,
        ]);
        $review = Review::create([
            'order_id' => $order->id,
            'user_id' => $author->id,
            'restaurant_id' => $restaurant->id,
            'rating' => 4,
        ]);

        $this->actingAs($otherCustomer, 'sanctum')
            ->deleteJson("/api/reviews/{$review->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('reviews', ['id' => $review->id]);
    }

    public function test_deleting_a_review_resets_restaurant_rating_when_it_was_the_last_review(): void
    {
        $customer = User::factory()->customer()->create();
        $restaurant = Restaurant::factory()->create(['avg_rating' => 4, 'total_reviews' => 1]);
        $order = Order::factory()->delivered()->create([
            'user_id' => $customer->id,
            'restaurant_id' => $restaurant->id,
        ]);
        $review = Review::create([
            'order_id' => $order->id,
            'user_id' => $customer->id,
            'restaurant_id' => $restaurant->id,
            'rating' => 4,
        ]);

        $this->actingAs($customer, 'sanctum')
            ->deleteJson("/api/reviews/{$review->id}")
            ->assertOk();

        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
        $this->assertDatabaseHas('restaurants', [
            'id' => $restaurant->id,
            'avg_rating' => 0,
            'total_reviews' => 0,
        ]);
    }

    public function test_customer_account_deletion_anonymizes_the_account_revokes_tokens_and_retains_orders(): void
    {
        $customer = User::factory()->customer()->create([
            'name' => 'Customer Name',
            'email' => 'customer@example.test',
            'phone' => '9000000000',
        ]);
        $order = Order::factory()->create(['user_id' => $customer->id]);
        $customer->createToken('browser');
        $customer->createToken('mobile');

        $this->actingAs($customer, 'sanctum')
            ->deleteJson('/api/auth/account', [
                'current_password' => 'password',
                'confirmation' => 'DELETE',
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Your account has been deleted.');

        $customer->refresh();
        $this->assertFalse($customer->is_active);
        $this->assertSame("Deleted customer #{$customer->id}", $customer->name);
        $this->assertNull($customer->phone);
        $this->assertStringStartsWith("deleted-customer-{$customer->id}-", $customer->email);
        $this->assertStringEndsWith('@deleted.invalid', $customer->email);
        $this->assertSame(0, $customer->tokens()->count());
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'user_id' => $customer->id]);
    }

    public function test_account_deletion_requires_the_current_password_and_confirmation_phrase(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer, 'sanctum')
            ->deleteJson('/api/auth/account', [
                'current_password' => 'wrong-password',
                'confirmation' => 'DELETE',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->assertTrue($customer->fresh()->is_active);
    }
}
