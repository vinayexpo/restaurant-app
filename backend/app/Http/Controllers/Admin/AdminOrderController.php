<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['restaurant:id,name', 'user:id,name,email'])->latest();

        $filters = $request->validate([
            'status' => 'nullable|string|max:50',
            'restaurant_id' => 'nullable|integer|exists:restaurants,id',
            'payment_method' => 'nullable|string|max:50',
            'search' => 'nullable|string|max:100',
            'customer' => 'nullable|string|max:100',
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d',
        ]);

        if ($status = $filters['status'] ?? null) {
            $query->where('status', $status);
        }

        if ($restaurantId = $filters['restaurant_id'] ?? null) {
            $query->where('restaurant_id', $restaurantId);
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

        if ($search = $filters['search'] ?? null) {
            $query->where(function ($query) use ($search) {
                $query->where('order_number', 'LIKE', "%{$search}%")
                    ->orWhereHas('user', fn ($userQuery) => $userQuery
                        ->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%"));
            });
        }

        if ($customer = $filters['customer'] ?? null) {
            $query->whereHas('user', fn ($userQuery) => $userQuery
                ->where('name', 'LIKE', "%{$customer}%")
                ->orWhere('email', 'LIKE', "%{$customer}%"));
        }

        return $this->paginated($query->paginate(15));
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with(['restaurant', 'user', 'items', 'statusHistory', 'deliveryAddress'])->findOrFail($id);

        return $this->success($order);
    }
}
