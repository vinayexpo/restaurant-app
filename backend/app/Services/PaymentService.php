<?php

namespace App\Services;

use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Refund;
use Illuminate\Support\Facades\DB;
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

    public function requestRefund(Order $order, float $amount, string $idempotencyKey, ?int $requestedBy = null, ?string $reason = null): Refund
    {
        $created = false;
        $refund = DB::transaction(function () use ($order, $amount, $idempotencyKey, $requestedBy, $reason, &$created) {
            $existing = Refund::where('order_id', $order->id)->where('idempotency_key', $idempotencyKey)->lockForUpdate()->first();
            if ($existing) {
                return $existing;
            }

            $alreadyRefunded = (float) Refund::where('order_id', $order->id)->where('status', 'processed')->sum('amount');
            if ($amount <= 0 || $amount > round((float) $order->total_amount - $alreadyRefunded, 2)) {
                abort(422, 'Refund amount exceeds the remaining refundable amount.');
            }

            $created = true;

            return Refund::create([
                'order_id' => $order->id,
                'requested_by' => $requestedBy,
                'idempotency_key' => $idempotencyKey,
                'razorpay_payment_id' => $order->razorpay_payment_id,
                'amount' => $amount,
                'reason' => $reason,
            ]);
        });

        // Never replay a provider call for an existing key: it may already have
        // succeeded and be awaiting its webhook after a process interruption.
        if (! $created || $refund->status !== 'requested') {
            return $refund;
        }

        try {
            $payload = $this->refundRazorpay($order->razorpay_payment_id, $amount);

            return $this->reconcileRefundPayload($payload, $refund);
        } catch (\Throwable $exception) {
            $refund->update(['status' => 'failed']);
            throw $exception;
        }
    }

    public function reconcileRefundPayload(array $payload, ?Refund $refund = null): ?Refund
    {
        $entity = $payload['refund']['entity'] ?? $payload;
        $refundId = $entity['id'] ?? null;
        $paymentId = $entity['payment_id'] ?? null;

        if (! $paymentId) {
            return null;
        }

        $refund ??= Refund::where('razorpay_refund_id', $refundId)->first()
            ?? Refund::where('razorpay_payment_id', $paymentId)->where('status', 'requested')->oldest()->first();

        if (! $refund) {
            $order = Order::where('razorpay_payment_id', $paymentId)->first();
            if (! $order || ! $refundId) {
                return null;
            }

            // A provider-initiated refund may arrive without a local request record.
            $refund = Refund::firstOrCreate(
                ['razorpay_refund_id' => $refundId],
                [
                    'order_id' => $order->id,
                    'idempotency_key' => "razorpay:{$refundId}",
                    'razorpay_payment_id' => $paymentId,
                    'amount' => round(((int) ($entity['amount'] ?? 0)) / 100, 2),
                ],
            );
        }

        $isProcessed = ($entity['status'] ?? null) === 'processed';
        $refund->update([
            'razorpay_refund_id' => $refundId ?? $refund->razorpay_refund_id,
            'status' => $isProcessed ? 'processed' : $refund->status,
            'provider_payload' => $entity,
            'processed_at' => $isProcessed ? now() : $refund->processed_at,
        ]);

        if ($isProcessed) {
            $this->finalizeRefund($refund->fresh());
        }

        return $refund->fresh();
    }

    private function finalizeRefund(Refund $refund): void
    {
        DB::transaction(function () use ($refund) {
            $refund = Refund::lockForUpdate()->findOrFail($refund->id);
            $order = Order::lockForUpdate()->findOrFail($refund->order_id);
            $refunded = (float) Refund::where('order_id', $order->id)->where('status', 'processed')->sum('amount');

            if ($refunded + 0.001 < (float) $order->total_amount) {
                return;
            }

            $order->update(['payment_status' => 'refunded']);
            if ($refund->benefits_restored_at) {
                return;
            }

            $this->restoreOrderBenefits($order);
            $refund->update(['benefits_restored_at' => now()]);
        });
    }

    public function restoreOrderBenefits(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order = Order::lockForUpdate()->findOrFail($order->id);
            app(LoyaltyService::class)->restoreRedemption($order);

            $usage = CouponUsage::where('order_id', $order->id)->first();
            if ($usage) {
                $usage->coupon()->decrement('used_count');
                $usage->delete();
            }
        });
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
        $this->reconcileRefundPayload($payload);
    }
}
