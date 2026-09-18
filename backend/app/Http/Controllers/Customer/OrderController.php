<?php

namespace App\Http\Controllers\Customer;

use App\Events\OrderStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Services\NotificationService;
use App\Services\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PaymentService $paymentService,
        private NotificationService $notificationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => 'nullable|in:pending,confirmed,preparing,ready_for_pickup,picked_up,on_the_way,delivered,cancelled',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $orders = Order::where('user_id', $request->user()->id)
            ->with('restaurant:id,name,logo,slug')
            ->withExists('review')
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
            ->latest()
            ->paginate(15);

        return $this->paginated($orders);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['items', 'statusHistory', 'restaurant', 'deliveryPartner.deliveryPartner', 'deliveryAddress', 'review'])
            ->findOrFail($id);

        return $this->success($order);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        if (! $order->canTransitionTo('cancelled')) {
            return $this->error('This order can no longer be cancelled.', [], 422);
        }

        $order = DB::transaction(function () use ($order, $validated, $request) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            if (! $order->canTransitionTo('cancelled')) {
                abort(422, 'This order can no longer be cancelled.');
            }

            if ($order->payment_method === 'razorpay' && $order->payment_status === 'paid' && $order->razorpay_payment_id) {
                $this->paymentService->requestRefund($order, (float) $order->total_amount, "customer-cancellation:{$order->id}", $request->user()->id, $validated['reason']);
            }

            $order->status = 'cancelled';
            $order->cancelled_at = now();
            $order->cancel_reason = $validated['reason'];
            $order->save();
            $this->paymentService->restoreOrderBenefits($order);

            $order->statusHistory()->create([
                'status' => 'cancelled',
                'changed_by' => $order->user_id,
                'note' => $validated['reason'],
            ]);

            return $order;
        });

        $order->loadMissing('restaurant.user');
        broadcast(new OrderStatusChanged($order->fresh()));

        $owner = $order->restaurant?->user;
        if ($owner) {
            $this->notificationService->send(
                $owner,
                'order_cancelled',
                "Order cancelled — {$order->order_number}",
                'The customer cancelled this order.',
                ['order_id' => $order->id, 'status' => 'cancelled']
            );
        }

        return $this->success($order->fresh(), 'Order cancelled successfully.');
    }

    public function reorder(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)->with('items.menuItem.restaurant')->findOrFail($id);

        $conflict = false;

        $cart = DB::transaction(function () use ($order, $request, &$conflict) {
            Cart::where('user_id', $request->user()->id)->delete();

            $restaurant = $order->restaurant;

            if (! $restaurant || ! $restaurant->is_active) {
                $conflict = true;

                return null;
            }

            $cart = Cart::create([
                'user_id' => $request->user()->id,
                'restaurant_id' => $order->restaurant_id,
            ]);

            foreach ($order->items as $item) {
                $menuItem = $item->menuItem;

                if (! $menuItem || ! $menuItem->is_available) {
                    $conflict = true;

                    continue;
                }

                $cart->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'variant_id' => null,
                    'quantity' => $item->quantity,
                    'unit_price' => $menuItem->discounted_price ?? $menuItem->price,
                ]);
            }

            return $cart;
        });

        $cart?->load(['restaurant', 'items.menuItem']);

        return $this->success([
            'cart' => $cart,
            'conflict' => $conflict,
        ]);
    }
}
