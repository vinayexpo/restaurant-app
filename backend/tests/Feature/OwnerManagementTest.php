<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_edit_and_clear_only_their_review_reply(): void
    {
        [$owner, $restaurant] = $this->ownerWithRestaurant();
        $customer = User::factory()->customer()->create();
        $order = Order::factory()->create(['restaurant_id' => $restaurant->id, 'user_id' => $customer->id]);
        $review = Review::create([
            'order_id' => $order->id,
            'user_id' => $customer->id,
            'restaurant_id' => $restaurant->id,
            'rating' => 5,
            'comment' => 'Excellent',
            'owner_reply' => 'Thank you!',
            'owner_replied_at' => now(),
        ]);

        $this->actingAs($owner)
            ->patchJson("/api/owner/reviews/{$review->id}/reply", ['owner_reply' => 'Thanks again!'])
            ->assertOk()
            ->assertJsonPath('data.owner_reply', 'Thanks again!');

        $this->actingAs($owner)
            ->deleteJson("/api/owner/reviews/{$review->id}/reply")
            ->assertOk()
            ->assertJsonPath('data.owner_reply', null)
            ->assertJsonPath('data.owner_replied_at', null);

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'owner_reply' => null, 'owner_replied_at' => null]);

        [, $otherRestaurant] = $this->ownerWithRestaurant();
        $otherOrder = Order::factory()->create(['restaurant_id' => $otherRestaurant->id, 'user_id' => $customer->id]);
        $otherReview = Review::create([
            'order_id' => $otherOrder->id,
            'user_id' => $customer->id,
            'restaurant_id' => $otherRestaurant->id,
            'rating' => 4,
        ]);

        $this->actingAs($owner)
            ->deleteJson("/api/owner/reviews/{$otherReview->id}/reply")
            ->assertNotFound();
    }

    public function test_owner_can_update_a_coupon(): void
    {
        [$owner, $restaurant] = $this->ownerWithRestaurant();
        $coupon = Coupon::create([
            'restaurant_id' => $restaurant->id,
            'code' => 'WELCOME10',
            'title' => 'Welcome',
            'type' => 'percentage',
            'value' => 10,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addWeek(),
            'is_active' => true,
        ]);

        $this->actingAs($owner)
            ->putJson("/api/owner/coupons/{$coupon->id}", [
                'code' => 'WELCOME15',
                'title' => 'Welcome back',
                'description' => 'A better welcome offer',
                'type' => 'percentage',
                'value' => 15,
                'min_order_amount' => 250,
                'max_discount' => 100,
                'usage_limit' => 50,
                'per_user_limit' => 2,
                'valid_from' => now()->toDateString(),
                'valid_until' => now()->addWeek()->toDateString(),
            ])
            ->assertOk()
            ->assertJsonPath('data.code', 'WELCOME15')
            ->assertJsonPath('data.description', 'A better welcome offer');

        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'code' => 'WELCOME15', 'value' => 15]);
    }

    public function test_compliance_changes_require_reapproval_while_other_settings_do_not(): void
    {
        [$owner, $restaurant] = $this->ownerWithRestaurant();

        $this->actingAs($owner)
            ->putJson('/api/owner/restaurant', ['cuisine_types' => ['Indian', 'Thai']])
            ->assertOk();

        $this->assertDatabaseHas('restaurants', ['id' => $restaurant->id, 'is_active' => true, 'is_verified' => true]);

        $this->actingAs($owner)
            ->putJson('/api/owner/restaurant', ['fssai_number' => '12345678901234', 'gst_number' => '27ABCDE1234F1Z5'])
            ->assertOk()
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.is_verified', false);

        $this->assertDatabaseHas('restaurants', [
            'id' => $restaurant->id,
            'fssai_number' => '12345678901234',
            'gst_number' => '27ABCDE1234F1Z5',
            'is_active' => false,
            'is_verified' => false,
        ]);
    }

    /** @return array{User, Restaurant} */
    private function ownerWithRestaurant(): array
    {
        $owner = User::factory()->restaurantOwner()->create();
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);

        return [$owner, $restaurant];
    }
}
