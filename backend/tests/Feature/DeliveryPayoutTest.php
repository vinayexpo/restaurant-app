<?php

namespace Tests\Feature;

use App\Models\DeliveryEarning;
use App\Models\DeliveryPartner;
use App\Models\DeliveryPayout;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeliveryPayoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_partner_can_save_an_encrypted_bank_account_and_request_available_earnings(): void
    {
        [$courier, $partner] = $this->deliveryPartner();
        $accountResponse = $this->actingAs($courier)->postJson('/api/delivery/payout-account', [
            'type' => 'bank_account',
            'account_holder_name' => 'Test Courier',
            'account_number' => '123456789012',
            'ifsc_code' => 'HDFC0001234',
        ]);

        $accountResponse->assertCreated()
            ->assertJsonPath('data.summary', 'Bank account ending 9012')
            ->assertJsonMissing(['account_number' => '123456789012']);
        $account = $partner->payoutAccounts()->firstOrFail();
        $earning = $this->earning($partner);

        $this->actingAs($courier)->postJson('/api/delivery/payouts', [
            'payout_account_id' => $account->id,
            'earning_ids' => [$earning->id],
        ])->assertCreated()->assertJsonPath('data.amount', '40.00');

        $this->assertDatabaseHas('delivery_payouts', ['delivery_partner_id' => $partner->id, 'amount' => 40]);
        $this->assertDatabaseHas('delivery_earnings', ['id' => $earning->id, 'delivery_payout_id' => 1]);
    }

    public function test_rejected_payout_releases_its_earnings_for_a_future_request(): void
    {
        [$courier, $partner] = $this->deliveryPartner();
        $account = $partner->payoutAccounts()->create([
            'type' => 'upi',
            'upi_id' => 'courier@bank',
        ]);
        $earning = $this->earning($partner);
        $payout = DeliveryPayout::create([
            'delivery_partner_id' => $partner->id,
            'delivery_payout_account_id' => $account->id,
            'amount' => 40,
        ]);
        $earning->update(['delivery_payout_id' => $payout->id]);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->patchJson("/api/admin/delivery-payouts/{$payout->id}/reject", [
            'reason' => 'Identity verification required.',
        ])->assertOk();

        $this->assertDatabaseHas('delivery_payouts', ['id' => $payout->id, 'status' => 'rejected']);
        $this->assertDatabaseHas('delivery_earnings', ['id' => $earning->id, 'delivery_payout_id' => null]);
    }

    public function test_processed_razorpay_webhook_marks_the_reserved_earnings_paid(): void
    {
        [$courier, $partner] = $this->deliveryPartner();
        $account = $partner->payoutAccounts()->create(['type' => 'upi', 'upi_id' => 'courier@bank']);
        $payout = DeliveryPayout::create([
            'delivery_partner_id' => $partner->id,
            'delivery_payout_account_id' => $account->id,
            'amount' => 40,
            'status' => 'processing',
            'provider_payout_id' => 'pout_test_123',
        ]);
        $earning = $this->earning($partner);
        $earning->update(['delivery_payout_id' => $payout->id]);
        config(['services.razorpay.webhook_secret' => 'webhook-secret']);
        $payload = ['event' => 'payout.processed', 'payload' => ['payout' => ['entity' => [
            'id' => 'pout_test_123', 'status' => 'processed',
        ]]]];
        $body = json_encode($payload, JSON_THROW_ON_ERROR);

        $this->call('POST', '/api/webhooks/razorpay', [], [], [], [
            'HTTP_X_RAZORPAY_SIGNATURE' => hash_hmac('sha256', $body, 'webhook-secret'),
            'CONTENT_TYPE' => 'application/json',
        ], $body)->assertNoContent();

        $this->assertDatabaseHas('delivery_payouts', ['id' => $payout->id, 'status' => 'paid']);
        $this->assertDatabaseHas('delivery_earnings', ['id' => $earning->id, 'status' => 'paid']);
    }

    private function deliveryPartner(): array
    {
        $courier = User::factory()->deliveryPartner()->create();
        $partner = DeliveryPartner::create([
            'user_id' => $courier->id,
            'vehicle_type' => 'motorcycle',
            'vehicle_number' => 'TEST-1234',
            'licence_number' => 'LIC-123456',
            'is_verified' => true,
        ]);

        return [$courier, $partner];
    }

    private function earning(DeliveryPartner $partner): DeliveryEarning
    {
        return DeliveryEarning::create([
            'delivery_partner_id' => $partner->id,
            'order_id' => Order::factory()->delivered()->create(['delivery_partner_id' => $partner->user_id])->id,
            'delivery_fee' => 50,
            'partner_share_pct' => 80,
            'amount_earned' => 40,
            'status' => 'pending',
        ]);
    }
}
