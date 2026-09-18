<?php

namespace Tests\Feature;

use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderStatusEmail;
use App\Models\DeliveryPartner;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_cannot_skip_an_order_lifecycle_state(): void
    {
        [$owner, $restaurant] = $this->ownerAndRestaurant();
        $order = Order::factory()->create(['restaurant_id' => $restaurant->id, 'status' => 'pending']);

        $this->actingAs($owner)
            ->patchJson("/api/owner/orders/{$order->id}/status", ['status' => 'preparing'])
            ->assertUnprocessable();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
        $this->assertDatabaseMissing('order_status_history', ['order_id' => $order->id, 'status' => 'preparing']);
    }

    public function test_owner_can_advance_an_order_to_its_next_state(): void
    {
        [$owner, $restaurant] = $this->ownerAndRestaurant();
        $order = Order::factory()->create(['restaurant_id' => $restaurant->id, 'status' => 'pending']);

        $this->actingAs($owner)
            ->patchJson("/api/owner/orders/{$order->id}/status", ['status' => 'confirmed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('order_status_history', [
            'order_id' => $order->id,
            'status' => 'confirmed',
            'changed_by' => $owner->id,
        ]);
    }

    public function test_cancellation_requires_a_reason(): void
    {
        $customer = User::factory()->customer()->create();
        $order = Order::factory()->create(['user_id' => $customer->id, 'status' => 'pending', 'payment_method' => 'cod']);

        $this->actingAs($customer)
            ->patchJson("/api/orders/{$order->id}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('reason');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
    }

    public function test_owner_cancellation_requires_a_reason(): void
    {
        [$owner, $restaurant] = $this->ownerAndRestaurant();
        $order = Order::factory()->create([
            'restaurant_id' => $restaurant->id,
            'status' => 'pending',
            'payment_method' => 'cod',
        ]);

        $this->actingAs($owner)
            ->patchJson("/api/owner/orders/{$order->id}/status", ['status' => 'cancelled'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('reason');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
    }

    public function test_customer_cannot_cancel_after_preparation_has_started(): void
    {
        $customer = User::factory()->customer()->create();
        $order = Order::factory()->create(['user_id' => $customer->id, 'status' => 'preparing', 'payment_method' => 'cod']);

        $this->actingAs($customer)
            ->patchJson("/api/orders/{$order->id}/cancel", ['reason' => 'Changed my mind'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This order can no longer be cancelled.');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'preparing']);
    }

    public function test_delivery_partner_cannot_skip_delivery_states(): void
    {
        [$courier] = $this->deliveryPartner();
        $order = Order::factory()->create([
            'delivery_partner_id' => $courier->id,
            'status' => 'ready_for_pickup',
        ]);

        $this->actingAs($courier)
            ->patchJson("/api/delivery/orders/{$order->id}/status", ['status' => 'on_the_way'])
            ->assertUnprocessable();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'ready_for_pickup']);
    }

    public function test_delivery_partner_cannot_accept_an_order_that_is_already_assigned(): void
    {
        [$courier] = $this->deliveryPartner();
        $otherCourier = User::factory()->deliveryPartner()->create();
        $order = Order::factory()->create([
            'delivery_partner_id' => $otherCourier->id,
            'status' => 'ready_for_pickup',
        ]);

        $this->actingAs($courier)
            ->postJson("/api/delivery/orders/{$order->id}/accept")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This order is no longer available.');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'delivery_partner_id' => $otherCourier->id]);
    }

    public function test_notification_jobs_have_bounded_retry_configuration(): void
    {
        foreach ([new SendOrderConfirmationEmail(Order::factory()->make()), new SendOrderStatusEmail(Order::factory()->make())] as $job) {
            $this->assertSame(3, $job->tries);
            $this->assertSame(60, $job->timeout);
            $this->assertSame([30, 60, 120], $job->backoff);
        }
    }

    private function ownerAndRestaurant(): array
    {
        $owner = User::factory()->restaurantOwner()->create();
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);

        return [$owner, $restaurant];
    }

    private function deliveryPartner(): array
    {
        $courier = User::factory()->deliveryPartner()->create();
        $partner = DeliveryPartner::create([
            'user_id' => $courier->id,
            'vehicle_type' => 'motorcycle',
            'vehicle_number' => 'TEST-1234',
            'licence_number' => 'LIC-123456',
            'is_available' => true,
        ]);

        return [$courier, $partner];
    }
}
