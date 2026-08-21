<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    public function revenue(Request $request): JsonResponse
    {
        $from = $request->query('date_from', now()->subDays(30)->toDateString());
        $to = $request->query('date_to', now()->toDateString());

        $breakdown = Order::where('status', 'delivered')
            ->whereBetween('created_at', ["{$from} 00:00:00", "{$to} 23:59:59"])
            ->selectRaw('DATE(created_at) as date, SUM(subtotal) as gross_order_volume, SUM(total_amount) as total_amount, COUNT(*) as order_count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totals = Order::where('status', 'delivered')
            ->whereBetween('created_at', ["{$from} 00:00:00", "{$to} 23:59:59"])
            ->selectRaw('SUM(subtotal) as gross_order_volume, SUM(total_amount) as total_amount, SUM(delivery_fee) as delivery_revenue, COUNT(*) as order_count')
            ->first();

        return $this->success([
            'date_from' => $from,
            'date_to' => $to,
            'breakdown' => $breakdown,
            'totals' => $totals,
        ]);
    }

    public function orders(Request $request): JsonResponse
    {
        $from = $request->query('date_from', now()->subDays(30)->toDateString());
        $to = $request->query('date_to', now()->toDateString());

        $statusBreakdown = Order::whereBetween('created_at', ["{$from} 00:00:00", "{$to} 23:59:59"])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        return $this->success([
            'date_from' => $from,
            'date_to' => $to,
            'status_breakdown' => $statusBreakdown,
        ]);
    }
}
