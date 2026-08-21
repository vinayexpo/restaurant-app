<?php

namespace App\Services;

use App\Models\Order;
use Razorpay\Api\Api;

class PaymentService
{
    private function api(): Api
    {
        return new Api(config('services.razorpay.key_id'), config('services.razorpay.key_secret'));
    }

    public function initiateRazorpay(float $amount, string $currency = 'INR'): array
    {
        $order = $this->api()->order->create([
            'amount' => (int) round($amount * 100),
            'currency' => $currency,
            'payment_capture' => 1,
        ]);

        return [
            'rzp_order_id' => $order['id'],
            'amount_paise' => $order['amount'],
            'currency' => $order['currency'],
            'key_id' => config('services.razorpay.key_id'),
        ];
    }

    public function verifyRazorpay(string $orderId, string $paymentId, string $signature): bool
    {
        $expected = hash_hmac(
            'sha256',
            $orderId.'|'.$paymentId,
            config('services.razorpay.key_secret')
        );

        return hash_equals($expected, $signature);
    }

    public function refundRazorpay(string $paymentId, float $amount): array
    {
        return $this->api()->payment->fetch($paymentId)->refund([
            'amount' => (int) round($amount * 100),
        ])->toArray();
    }

    public function handleCaptured(array $payload): void
    {
        $paymentId = $payload['payment']['entity']['id'] ?? null;
        $orderId = $payload['payment']['entity']['order_id'] ?? null;

        if (! $orderId) {
            return;
        }

        Order::where('razorpay_order_id', $orderId)->update([
            'payment_status' => 'paid',
            'razorpay_payment_id' => $paymentId,
        ]);
    }

    public function handleFailed(array $payload): void
    {
        $orderId = $payload['payment']['entity']['order_id'] ?? null;

        if (! $orderId) {
            return;
        }

        Order::where('razorpay_order_id', $orderId)->update([
            'payment_status' => 'failed',
        ]);
    }

    public function handleRefund(array $payload): void
    {
        $paymentId = $payload['refund']['entity']['payment_id'] ?? null;

        if (! $paymentId) {
            return;
        }

        Order::where('razorpay_payment_id', $paymentId)->update([
            'payment_status' => 'refunded',
        ]);
    }
}
