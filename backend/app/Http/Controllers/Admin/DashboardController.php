<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPartner;
use App\Models\Order;
use App\Models\Restaurant;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function stats(): JsonResponse
    {
        return $this->success([
            'orders_today' => Order::whereDate('created_at', today())->count(),
            'revenue_today' => (float) Order::whereDate('created_at', today())->where('status', 'delivered')->sum('total_amount'),
            'active_restaurants' => Restaurant::where('is_active', true)->count(),
            'pending_restaurant_approvals' => Restaurant::where('is_active', false)->whereNull('rejection_reason')->count(),
            'active_delivery_partners' => DeliveryPartner::where('is_verified', true)->count(),
            'orders_success_rate' => $this->orderSuccessRate(),
        ]);
    }

    private function orderSuccessRate(): float
    {
        $total = Order::whereDate('created_at', today())->count();

        if ($total === 0) {
            return 0;
        }

        $delivered = Order::whereDate('created_at', today())->where('status', 'delivered')->count();

        return round(($delivered / $total) * 100, 2);
    }
}
