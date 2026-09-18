<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\LoyaltyTransaction;
use App\Models\Order;
use App\Models\User;
use App\Services\LoyaltyService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RefundReconciliationTest extends TestCase
{
    use RefreshDatabase;

    public function test_processed_refund_webhook_is_persisted_and_restores_order_benefits_once(): void
    {
        $user = User::factory()->customer()->create();
        $order = Order::factory()->cancelled()->create([
            'user_id' => $user->id,
            'payment_method' => 'razorpay',
            'payment_status' => 'paid',
            'razorpay_payment_id' => 'pay_test_refund',
            'total_amount' => 100,
            'loyalty_points_redeemed' => 100,
        ]);
        $coupon = Coupon::create([
            'code' => 'RESTORE100',
            'title' => 'Restore test',
            'type' => 'fixed',
            'value' => 10,
            'min_order_amount' => 0,
            'per_user_limit' => 1,
            'used_count' => 1,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDay(),
            'is_active' => true,
        ]);
        CouponUsage::create(['coupon_id' => $coupon->id, 'user_id' => $user->id, 'order_id' => $order->id]);
        app(LoyaltyService::class)->pointsFor($user)->update(['balance' => 0]);

        $payload = ['refund' => ['entity' => [
            'id' => 'rfnd_test_1',
            'payment_id' => 'pay_test_refund',
            'amount' => 10000,
            'status' => 'processed',
        ]]];

        app(PaymentService::class)->handleRefund($payload);
        app(PaymentService::class)->handleRefund($payload);

        $this->assertDatabaseHas('refunds', ['order_id' => $order->id, 'razorpay_refund_id' => 'rfnd_test_1', 'status' => 'processed']);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'payment_status' => 'refunded']);
        $this->assertDatabaseMissing('coupon_usages', ['order_id' => $order->id]);
        $this->assertSame(0, $coupon->fresh()->used_count);
        $this->assertSame(100, app(LoyaltyService::class)->pointsFor($user)->fresh()->balance);
        $this->assertSame(1, LoyaltyTransaction::where('user_id', $user->id)->where('order_id', $order->id)->where('type', 'adjusted')->count());
    }

    public function test_payment_initiation_rejects_an_untrusted_amount_without_checkout_data(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)
            ->postJson('/api/payment/initiate', ['amount' => 1])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['address_id']);
    }
}
