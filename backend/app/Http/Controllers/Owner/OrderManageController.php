<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderManageController extends Controller
{
    use ApiResponse;

    public function __construct(private OrderService $orderService) {}

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

        $this->orderService->updateStatus($order, $validated['status'], $request->user(), $validated['note'] ?? null);

        return $this->success($order->fresh(), 'Order status updated.');
    }
}
