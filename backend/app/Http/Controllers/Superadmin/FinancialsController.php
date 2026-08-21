<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PlatformCommission;
use App\Models\PlatformSetting;
use App\Models\Restaurant;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialsController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $from = $request->query('date_from', now()->subDays(30)->toDateString());
        $to = $request->query('date_to', now()->toDateString());

        $defaultCommissionPct = (float) PlatformSetting::get('default_commission_pct', 10);
        $overrides = PlatformCommission::pluck('rate_pct', 'restaurant_id');

        $orders = Order::where('status', 'delivered')
            ->whereBetween('created_at', ["{$from} 00:00:00", "{$to} 23:59:59"])
            ->get(['restaurant_id', 'subtotal', 'delivery_fee', 'total_amount']);

        $grossOrderValue = (float) $orders->sum('total_amount');
        $deliveryRevenue = (float) $orders->sum('delivery_fee');
        $refundsIssued = (float) Order::where('payment_status', 'refunded')
            ->whereBetween('updated_at', ["{$from} 00:00:00", "{$to} 23:59:59"])
            ->sum('total_amount');

        $commissionByRestaurant = [];
        $totalCommission = 0.0;

        foreach ($orders->groupBy('restaurant_id') as $restaurantId => $restaurantOrders) {
            $rate = (float) ($overrides[$restaurantId] ?? $defaultCommissionPct);
            $subtotal = (float) $restaurantOrders->sum('subtotal');
            $commission = round($subtotal * $rate / 100, 2);

            $commissionByRestaurant[] = [
                'restaurant_id' => $restaurantId,
                'gmv' => $subtotal,
                'commission_rate' => $rate,
                'commission_earned' => $commission,
            ];

            $totalCommission += $commission;
        }

        $restaurantNames = Restaurant::whereIn('id', array_column($commissionByRestaurant, 'restaurant_id'))
            ->pluck('name', 'id');

        foreach ($commissionByRestaurant as &$row) {
            $row['restaurant_name'] = $restaurantNames[$row['restaurant_id']] ?? null;
        }

        $netRevenue = round($totalCommission + $deliveryRevenue - $refundsIssued, 2);

        return $this->success([
            'date_from' => $from,
            'date_to' => $to,
            'gross_order_value' => $grossOrderValue,
            'platform_commission' => round($totalCommission, 2),
            'delivery_revenue' => $deliveryRevenue,
            'refunds_issued' => $refundsIssued,
            'net_platform_revenue' => $netRevenue,
            'by_restaurant' => $commissionByRestaurant,
        ]);
    }
}
