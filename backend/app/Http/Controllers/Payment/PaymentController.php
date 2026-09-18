<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\CheckoutQuote;
use App\Services\DeliveryPayoutService;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PaymentService $paymentService,
        private OrderService $orderService,
        private DeliveryPayoutService $deliveryPayoutService,
    ) {}

    public function initiate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'address_id' => 'required|integer',
            'coupon_code' => 'nullable|string|max:50',
            'loyalty_points' => 'nullable|integer|min:0',
            'special_instructions' => 'nullable|string|max:1000',
        ]);

        $quote = $this->orderService->quoteFromCart($request);
        $data = $this->paymentService->initiateRazorpay($quote['total_amount']);
        CheckoutQuote::create([
            'user_id' => $request->user()->id,
            'razorpay_order_id' => $data['rzp_order_id'],
            'total_amount' => $quote['total_amount'],
            'checkout_data' => [
                'address_id' => (int) $validated['address_id'],
                'coupon_code' => $validated['coupon_code'] ?? null,
                'loyalty_points' => (int) ($validated['loyalty_points'] ?? 0),
                'special_instructions' => $validated['special_instructions'] ?? null,
            ],
            'expires_at' => now()->addMinutes(15),
        ]);

        return $this->success($data + ['total_amount' => $quote['total_amount']]);
    }

    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:razorpay,cod',
            'rzp_order_id' => 'required_if:payment_method,razorpay|string',
            'rzp_payment_id' => 'required_if:payment_method,razorpay|string',
            'rzp_signature' => 'required_if:payment_method,razorpay|string',
            'address_id' => 'required|integer',
            'coupon_code' => 'nullable|string',
            'loyalty_points' => 'nullable|integer|min:0',
            'special_instructions' => 'nullable|string|max:1000',
        ]);

        if ($validated['payment_method'] === 'razorpay') {
            $valid = $this->paymentService->verifyRazorpay(
                $validated['rzp_order_id'],
                $validated['rzp_payment_id'],
                $validated['rzp_signature']
            );

            if (! $valid) {
                return $this->error('Payment verification failed.', [], 422);
            }

            $quote = CheckoutQuote::where('razorpay_order_id', $validated['rzp_order_id'])
                ->where('user_id', $request->user()->id)->whereNull('consumed_at')
                ->where('expires_at', '>', now())->first();
            $checkoutData = [
                'address_id' => (int) $validated['address_id'],
                'coupon_code' => $validated['coupon_code'] ?? null,
                'loyalty_points' => (int) ($validated['loyalty_points'] ?? 0),
                'special_instructions' => $validated['special_instructions'] ?? null,
            ];

            if (! $quote || $quote->checkout_data !== $checkoutData) {
                return $this->error('Checkout quote is invalid or has expired.', [], 422);
            }

            $currentQuote = $this->orderService->quoteFromCart($request);
            if (abs($currentQuote['total_amount'] - (float) $quote->total_amount) > 0.001) {
                return $this->error('Your cart total changed. Please start checkout again.', [], 422);
            }
        }

        $order = DB::transaction(function () use ($request, $validated) {
            if ($validated['payment_method'] === 'razorpay') {
                $claimed = CheckoutQuote::where('razorpay_order_id', $validated['rzp_order_id'])
                    ->whereNull('consumed_at')
                    ->where('expires_at', '>', now())
                    ->update(['consumed_at' => now()]);

                if ($claimed !== 1) {
                    abort(422, 'Checkout quote is invalid or has already been used.');
                }
            }

            return $this->orderService->createFromCart($request);
        });

        return $this->success([
            'order_id' => $order->id,
            'order_number' => $order->order_number,
        ], 'Order placed successfully.', 201);
    }

    public function razorpayWebhook(Request $request): Response
    {
        $signature = $request->header('X-Razorpay-Signature', '');
        $body = $request->getContent();
        $expected = hash_hmac('sha256', $body, config('services.razorpay.webhook_secret'));

        if (! hash_equals($expected, $signature)) {
            abort(400, 'Invalid webhook signature.');
        }

        $event = $request->json('event');

        match ($event) {
            'payment.captured' => $this->paymentService->handleCaptured($request->json('payload')),
            'payment.failed' => $this->paymentService->handleFailed($request->json('payload')),
            'refund.created' => $this->paymentService->handleRefund($request->json('payload')),
            'payout.processed', 'payout.failed', 'payout.reversed', 'payout.queued', 'payout.pending' => $this->deliveryPayoutService->settleFromWebhook($request->json('payload.payout.entity', [])),
            default => null,
        };

        return response()->noContent();
    }
}
