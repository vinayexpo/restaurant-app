<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaymentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PaymentService $paymentService,
        private OrderService $orderService,
    ) {}

    public function initiate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $data = $this->paymentService->initiateRazorpay($validated['amount']);

        return $this->success($data);
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
        }

        $order = $this->orderService->createFromCart($request);

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
            default => null,
        };

        return response()->noContent();
    }
}
