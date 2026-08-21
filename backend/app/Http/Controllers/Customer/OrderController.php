<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Services\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(private PaymentService $paymentService) {}

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('restaurant:id,name,logo,slug')
            ->withExists('review')
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

        if (! in_array($order->status, ['pending', 'confirmed'], true)) {
            return $this->error('This order can no longer be cancelled.', [], 422);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($order, $validated) {
            if ($order->payment_method === 'razorpay' && $order->payment_status === 'paid' && $order->razorpay_payment_id) {
                $this->paymentService->refundRazorpay($order->razorpay_payment_id, (float) $order->total_amount);
                $order->payment_status = 'refunded';
            }

            $order->status = 'cancelled';
            $order->cancelled_at = now();
            $order->cancel_reason = $validated['reason'] ?? null;
            $order->save();

            $order->statusHistory()->create([
                'status' => 'cancelled',
                'changed_by' => $order->user_id,
                'note' => $validated['reason'] ?? null,
            ]);
        });

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
