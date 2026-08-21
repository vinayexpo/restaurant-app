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
        $query = Order::where('restaurant_id', $request->get('restaurant')->id)
            ->with(['user:id,name,phone', 'items'])
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $this->paginated($query->paginate(15));
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
