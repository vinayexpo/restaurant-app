<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PlatformCommission;
use App\Models\PlatformSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RevenueController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $restaurant = $request->get('restaurant');
        $period = $request->query('period', 'daily');

        $dateFormat = match ($period) {
            'weekly' => '%x-W%v',
            'monthly' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $breakdown = Order::where('restaurant_id', $restaurant->id)
            ->where('status', 'delivered')
            ->selectRaw("DATE_FORMAT(created_at, '{$dateFormat}') as period, SUM(subtotal) as revenue, COUNT(*) as order_count")
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $commissionRow = PlatformCommission::where('restaurant_id', $restaurant->id)->first();
        $commissionPct = $commissionRow ? (float) $commissionRow->rate_pct : (float) PlatformSetting::get('default_commission_pct', 10);

        $totalRevenue = (float) Order::where('restaurant_id', $restaurant->id)->where('status', 'delivered')->sum('subtotal');
        $commissionDeducted = round($totalRevenue * $commissionPct / 100, 2);

        $topItems = OrderItem::join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.restaurant_id', $restaurant->id)
            ->where('orders.status', 'delivered')
            ->selectRaw('order_items.menu_item_name, SUM(order_items.quantity) as total_quantity, SUM(order_items.total_price) as total_revenue')
            ->groupBy('order_items.menu_item_name')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        return $this->success([
            'period' => $period,
            'breakdown' => $breakdown,
            'total_revenue' => $totalRevenue,
            'commission_pct' => $commissionPct,
            'commission_deducted' => $commissionDeducted,
            'net_revenue' => round($totalRevenue - $commissionDeducted, 2),
            'top_items' => $topItems,
        ]);
    }
}
