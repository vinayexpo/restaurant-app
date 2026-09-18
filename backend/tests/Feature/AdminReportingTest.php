<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminReportingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_order_list_applies_status_payment_and_customer_filters(): void
    {
        $admin = User::factory()->admin()->create();
        $matchingCustomer = User::factory()->customer()->create(['name' => 'Asha Patel']);
        $matchingOrder = Order::factory()->delivered()->create([
            'user_id' => $matchingCustomer->id,
            'payment_method' => 'razorpay',
        ]);
        Order::factory()->delivered()->create(['user_id' => $matchingCustomer->id, 'payment_method' => 'cod']);
        Order::factory()->cancelled()->create(['payment_method' => 'razorpay']);

        $this->actingAs($admin)
            ->getJson('/api/admin/orders?status=delivered&payment_method=razorpay&customer=Asha')
            ->assertOk()
            ->assertJsonPath('data.0.id', $matchingOrder->id)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.page', 1)
            ->assertJsonPath('meta.total', 1);
    }

    public function test_reports_expose_refund_and_cancellation_totals_for_the_selected_dates(): void
    {
        $admin = User::factory()->admin()->create();
        Order::factory()->delivered()->create([
            'subtotal' => 100,
            'delivery_fee' => 20,
            'tax_amount' => 5,
            'total_amount' => 125,
            'created_at' => '2026-09-10 12:00:00',
        ]);
        Order::factory()->cancelled()->create([
            'total_amount' => 75,
            'cancelled_at' => '2026-09-12 12:00:00',
        ]);
        Order::factory()->cancelled()->create([
            'payment_status' => 'refunded',
            'total_amount' => 50,
            'cancelled_at' => '2026-09-12 12:00:00',
            'updated_at' => '2026-09-12 12:00:00',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/admin/reports/revenue?date_from=2026-09-10&date_to=2026-09-12')
            ->assertOk()
            ->assertJsonPath('data.refunds.order_count', 1)
            ->assertJsonPath('data.refunds.total_amount', '50.00')
            ->assertJsonPath('data.cancellations.order_count', 2)
            ->assertJsonPath('data.cancellations.total_amount', '125.00');
    }

    public function test_financials_expose_refund_and_cancellation_counts(): void
    {
        $superadmin = User::factory()->superadmin()->create();
        Order::factory()->cancelled()->create([
            'payment_status' => 'refunded',
            'total_amount' => 50,
            'cancelled_at' => '2026-09-12 12:00:00',
            'updated_at' => '2026-09-12 12:00:00',
        ]);

        $this->actingAs($superadmin)
            ->getJson('/api/superadmin/financials?date_from=2026-09-10&date_to=2026-09-12')
            ->assertOk()
            ->assertJsonPath('data.refunds_issued', 50)
            ->assertJsonPath('data.refunded_order_count', 1)
            ->assertJsonPath('data.cancelled_order_count', 1)
            ->assertJsonPath('data.cancelled_order_value', 50);
    }
}
