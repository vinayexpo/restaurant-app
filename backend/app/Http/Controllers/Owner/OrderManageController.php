<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderManageController extends Controller
{
    use ApiResponse;

    public function __construct(
        private OrderService $orderService,
        private PaymentService $paymentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => 'nullable|string|in:pending,confirmed,preparing,ready_for_pickup,picked_up,on_the_way,delivered,cancelled',
            'search' => 'nullable|string|max:100',
            'customer' => 'nullable|string|max:100',
            'payment_method' => 'nullable|string|in:cod,razorpay',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);
        $query = Order::where('restaurant_id', $request->get('restaurant')->id)
            ->with(['user:id,name,phone', 'items'])
            ->latest();

        if ($status = $filters['status'] ?? null) {
            $query->where('status', $status);
        }
        if ($search = $filters['search'] ?? null) {
            $query->where('order_number', 'like', "%{$search}%");
        }
        if ($customer = $filters['customer'] ?? null) {
            $query->whereHas('user', fn ($user) => $user->where('name', 'like', "%{$customer}%"));
        }
        if ($paymentMethod = $filters['payment_method'] ?? null) {
            $query->where('payment_method', $paymentMethod);
        }
        if ($from = $filters['date_from'] ?? null) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $filters['date_to'] ?? null) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $this->paginated($query->paginate(15));
    }

    public function statusCounts(Request $request): JsonResponse
    {
        $counts = Order::where('restaurant_id', $request->get('restaurant')->id)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return $this->success($counts);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('restaurant_id', $request->get('restaurant')->id)
            ->with(['user', 'items', 'statusHistory', 'deliveryAddress'])
            ->findOrFail($id);

        return $this->success($order);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'preparing', 'ready_for_pickup', 'cancelled'])],
            'note' => 'nullable|string|max:255',
        ]);

        if ($validated['status'] === 'cancelled' && ! in_array($order->status, ['pending', 'confirmed'], true)) {
            return $this->error('Only pending or confirmed orders can be cancelled.', [], 422);
        }

        $message = 'Order status updated.';

        if ($validated['status'] === 'cancelled') {
            $wasPaidOnline = $order->payment_method === 'razorpay' && $order->payment_status === 'paid';

            if ($wasPaidOnline) {
                $this->refundPaidOrder($order);
            }

            $order->update([
                'cancelled_at' => now(),
                'cancel_reason' => $validated['note'] ?? null,
            ]);
            $message = $wasPaidOnline
                ? 'Order cancelled and payment refunded.'
                : 'Order cancelled.';
        }

        $this->orderService->updateStatus($order, $validated['status'], $request->user(), $validated['note'] ?? null);

        return $this->success($order->fresh(), $message);
    }

    public function refund(Request $request, int $id): JsonResponse
    {
        $order = Order::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);

        if ($order->status !== 'cancelled') {
            return $this->error('Only cancelled orders can be refunded.', [], 422);
        }

        $this->refundPaidOrder($order);

        return $this->success($order->fresh(), 'Payment refunded successfully.');
    }

    private function refundPaidOrder(Order $order): void
    {
        if ($order->payment_status === 'refunded') {
            return;
        }

        if ($order->payment_method !== 'razorpay' || $order->payment_status !== 'paid' || ! $order->razorpay_payment_id) {
            abort(422, 'This order does not have a refundable online payment.');
        }

        $this->paymentService->refundRazorpay($order->razorpay_payment_id, (float) $order->total_amount);
        $order->update(['payment_status' => 'refunded']);
    }
}
