<?php

namespace Tests\Feature;

use App\Models\DeliveryPartner;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeliveryCashPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigned_partner_can_confirm_cash_for_a_delivered_cod_order(): void
    {
        [$courier, $partner] = $this->deliveryPartner();
        $order = Order::factory()->delivered()->create([
            'delivery_partner_id' => $courier->id,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
        ]);

        $response = $this->actingAs($courier)
            ->patchJson("/api/delivery/orders/{$order->id}/payment");

        $response->assertOk()->assertJsonPath('data.payment_status', 'paid');
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'payment_status' => 'paid']);
    }

    public function test_cash_confirmation_requires_a_delivered_cod_order(): void
    {
        [$courier] = $this->deliveryPartner();
        $order = Order::factory()->create([
            'delivery_partner_id' => $courier->id,
            'status' => 'on_the_way',
            'payment_method' => 'cod',
            'payment_status' => 'pending',
        ]);

        $this->actingAs($courier)
            ->patchJson("/api/delivery/orders/{$order->id}/payment")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Cash can only be confirmed after the order is delivered.');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'payment_status' => 'pending']);
    }

    private function deliveryPartner(): array
    {
        $courier = User::factory()->deliveryPartner()->create();
        $partner = DeliveryPartner::create([
            'user_id' => $courier->id,
            'vehicle_type' => 'motorcycle',
            'vehicle_number' => 'TEST-1234',
            'licence_number' => 'LIC-123456',
        ]);

        return [$courier, $partner];
    }
}
