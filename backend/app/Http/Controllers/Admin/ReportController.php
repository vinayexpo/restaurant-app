<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{
    use ApiResponse;

    public function revenue(Request $request): JsonResponse
    {
        [$from, $to] = $this->dateRange($request);

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

        // Refund timestamps are not stored separately, so updated_at is the existing record of the refund event.
        $refunds = Order::where('payment_status', 'refunded')
            ->whereBetween('updated_at', ["{$from} 00:00:00", "{$to} 23:59:59"])
            ->selectRaw('SUM(total_amount) as total_amount, COUNT(*) as order_count')
            ->first();

        $cancellations = Order::where('status', 'cancelled')
            ->whereBetween('cancelled_at', ["{$from} 00:00:00", "{$to} 23:59:59"])
            ->selectRaw('SUM(total_amount) as total_amount, COUNT(*) as order_count')
            ->first();

        return $this->success([
            'date_from' => $from,
            'date_to' => $to,
            'breakdown' => $breakdown,
            'totals' => $totals,
            'refunds' => $refunds,
            'cancellations' => $cancellations,
        ]);
    }

    public function orders(Request $request): JsonResponse
    {
        [$from, $to] = $this->dateRange($request);

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

    private function dateRange(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d',
        ]);

        $from = Carbon::parse($validated['date_from'] ?? now()->subDays(30)->toDateString())->startOfDay();
        $to = Carbon::parse($validated['date_to'] ?? now()->toDateString())->endOfDay();

        if ($to->lt($from)) {
            throw ValidationException::withMessages([
                'date_to' => 'The end date must not be before the start date.',
            ]);
        }

        if ($from->diffInDays($to) > 366) {
            throw ValidationException::withMessages([
                'date_to' => 'The reporting date range may not exceed 366 days.',
            ]);
        }

        return [$from->toDateString(), $to->toDateString()];
    }
}
