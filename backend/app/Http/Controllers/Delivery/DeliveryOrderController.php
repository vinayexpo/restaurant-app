<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\DeliveryEarning;
use App\Models\DeliveryPartner;
use App\Models\Order;
use App\Services\OrderService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeliveryOrderController extends Controller
{
    use ApiResponse;

    public function __construct(private OrderService $orderService) {}

    public function available(Request $request): JsonResponse
    {
        $partner = DeliveryPartner::where('user_id', $request->user()->id)->firstOrFail();

        if (! $partner->is_available) {
            return $this->error('You must be available to view orders.', [], 422);
        }

        $query = Order::where('status', 'ready_for_pickup')
            ->whereNull('delivery_partner_id')
            ->with('restaurant:id,name,address,city,latitude,longitude');

        if ($partner->current_latitude && $partner->current_longitude) {
            $query->join('restaurants', 'restaurants.id', '=', 'orders.restaurant_id')
                ->selectRaw(
                    'orders.*, (6371 * acos(cos(radians(?)) * cos(radians(restaurants.latitude)) * cos(radians(restaurants.longitude) - radians(?)) + sin(radians(?)) * sin(radians(restaurants.latitude)))) AS distance',
                    [$partner->current_latitude, $partner->current_longitude, $partner->current_latitude]
                )
                ->orderBy('distance');
        } else {
            $query->latest();
        }

        return $this->success($query->limit(20)->get());
    }

    public function accept(Request $request, int $id): JsonResponse
    {
        $partner = DeliveryPartner::where('user_id', $request->user()->id)->firstOrFail();

        if (! $partner->is_available) {
            return $this->error('You must be available to accept orders.', [], 422);
        }

        $order = Order::where('status', 'ready_for_pickup')->whereNull('delivery_partner_id')->find($id);

        if (! $order) {
            return $this->error('This order is no longer available.', [], 422);
        }

        $order->update(['delivery_partner_id' => $request->user()->id]);

        return $this->success($order->fresh(), 'Order accepted.');
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::where('delivery_partner_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['picked_up', 'on_the_way', 'delivered'])],
        ]);

        $this->orderService->updateStatus($order, $validated['status'], $request->user());

        return $this->success($order->fresh(), 'Order status updated.');
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('delivery_partner_id', $request->user()->id)
            ->with(['restaurant', 'deliveryAddress', 'user:id,name,phone'])
            ->findOrFail($id);

        return $this->success($order);
    }

    public function history(Request $request): JsonResponse
    {
        $orders = Order::where('delivery_partner_id', $request->user()->id)
            ->where('status', 'delivered')
            ->with('restaurant:id,name')
            ->latest()
            ->paginate(15);

        return $this->paginated($orders);
    }

    public function earnings(Request $request): JsonResponse
    {
        $partner = DeliveryPartner::where('user_id', $request->user()->id)->firstOrFail();

        $earnings = DeliveryEarning::where('delivery_partner_id', $partner->id)
            ->with('order:id,order_number,restaurant_id')
            ->latest()
            ->paginate(15);

        $totalEarned = DeliveryEarning::where('delivery_partner_id', $partner->id)->sum('amount_earned');
        $pendingPayout = DeliveryEarning::where('delivery_partner_id', $partner->id)->where('status', 'pending')->sum('amount_earned');

        return response()->json([
            'success' => true,
            'data' => $earnings->items(),
            'message' => '',
            'meta' => [
                'page' => $earnings->currentPage(),
                'per_page' => $earnings->perPage(),
                'total' => $earnings->total(),
                'last_page' => $earnings->lastPage(),
                'total_earned' => (float) $totalEarned,
                'pending_payout' => (float) $pendingPayout,
            ],
        ]);
    }

    public function earningsSummary(Request $request): JsonResponse
    {
        $partner = DeliveryPartner::where('user_id', $request->user()->id)->firstOrFail();

        $today = DeliveryEarning::where('delivery_partner_id', $partner->id)->whereDate('created_at', today())->sum('amount_earned');
        $week = DeliveryEarning::where('delivery_partner_id', $partner->id)->where('created_at', '>=', now()->startOfWeek())->sum('amount_earned');
        $month = DeliveryEarning::where('delivery_partner_id', $partner->id)->where('created_at', '>=', now()->startOfMonth())->sum('amount_earned');

        return $this->success([
            'today' => (float) $today,
            'week' => (float) $week,
            'month' => (float) $month,
            'total_deliveries' => $partner->total_deliveries,
        ]);
    }
}
