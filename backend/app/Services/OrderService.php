<?php

namespace App\Services;

use App\Events\NewOrderReceived;
use App\Events\OrderStatusChanged;
use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderStatusEmail;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\PlatformSetting;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class OrderService
{
    public function __construct(
        private LoyaltyService $loyaltyService,
        private EarningsService $earningsService,
        private NotificationService $notificationService,
    ) {}

    private const STATUS_MESSAGES = [
        'confirmed' => ['title' => 'Order Confirmed', 'body' => 'has confirmed your order and will start preparing it soon.'],
        'preparing' => ['title' => 'Order Being Prepared', 'body' => 'is preparing your order.'],
        'ready_for_pickup' => ['title' => 'Order Ready', 'body' => 'has your order ready for pickup.'],
        'picked_up' => ['title' => 'Order Picked Up', 'body' => 'Your delivery partner has picked up your order.'],
        'on_the_way' => ['title' => 'Order On The Way', 'body' => 'Your order is on its way to you.'],
        'delivered' => ['title' => 'Order Delivered', 'body' => 'Your order has been delivered. Enjoy your meal!'],
        'cancelled' => ['title' => 'Order Cancelled', 'body' => 'Your order was cancelled.'],
    ];

    public function createFromCart(Request $request): Order
    {
        $user = $request->user();
        $address = Address::where('id', $request->address_id)->where('user_id', $user->id)->firstOrFail();

        $cart = Cart::where('user_id', $user->id)->with(['items.menuItem', 'items.variant'])->firstOrFail();
        $items = $cart->items;

        if ($items->isEmpty()) {
            abort(422, 'Cart is empty.');
        }

        $restaurant = Restaurant::findOrFail($cart->restaurant_id);

        // 1. Preserve the server-calculated cart price, including active menu discounts.
        $subtotal = $items->sum(fn ($item) => $item->unit_price * $item->quantity);

        if ($subtotal < $restaurant->min_order_amount) {
            abort(422, "Minimum order amount is ₹{$restaurant->min_order_amount}.");
        }

        // 2. Delivery fee
        $deliveryFee = (float) $restaurant->delivery_fee;

        // 3. Coupon discount
        $discountAmount = 0;
        $coupon = null;
        if ($request->coupon_code) {
            $coupon = $this->validateCoupon($request->coupon_code, $user, $restaurant, $subtotal);
            $discountAmount = $coupon->type === 'percentage'
                ? min($subtotal * $coupon->value / 100, $coupon->max_discount ?? PHP_INT_MAX)
                : min((float) $coupon->value, $subtotal);
            $discountAmount = round($discountAmount, 2);
        }

        // 4. Loyalty discount — mutually exclusive with coupon
        $loyaltyDiscount = 0;
        $loyaltyPointsRedeemed = 0;
        if (! $coupon && $request->loyalty_points > 0) {
            [$loyaltyDiscount, $loyaltyPointsRedeemed] = $this->loyaltyService->calculateRedemption(
                $user, (int) $request->loyalty_points, $subtotal
            );
        }

        // 5. Tax — on subtotal after discounts
        $taxRate = (float) PlatformSetting::get('tax_rate_pct', 5);
        $taxableAmount = max(0, $subtotal - $discountAmount - $loyaltyDiscount);
        $taxAmount = round($taxableAmount * $taxRate / 100, 2);

        // 6. Grand total
        $totalAmount = round($taxableAmount + $deliveryFee + $taxAmount, 2);

        $order = DB::transaction(function () use (
            $user, $address, $restaurant, $items,
            $subtotal, $deliveryFee, $discountAmount, $loyaltyDiscount,
            $loyaltyPointsRedeemed, $taxAmount, $totalAmount, $coupon, $request, $cart
        ) {
            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $user->id,
                'restaurant_id' => $restaurant->id,
                'delivery_address_id' => $address->id,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cod' ? 'pending' : 'paid',
                'razorpay_order_id' => $request->rzp_order_id,
                'razorpay_payment_id' => $request->rzp_payment_id,
                'razorpay_signature' => $request->rzp_signature,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'discount_amount' => $discountAmount,
                'loyalty_points_redeemed' => $loyaltyPointsRedeemed,
                'loyalty_discount_amount' => $loyaltyDiscount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'coupon_code' => $coupon?->code,
                'special_instructions' => $request->special_instructions,
            ]);

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item->menu_item_id,
                    'menu_item_name' => $item->menuItem->name,
                    'variant_name' => $item->variant?->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->unit_price * $item->quantity,
                ]);
            }

            if ($coupon) {
                CouponUsage::create(['coupon_id' => $coupon->id, 'user_id' => $user->id, 'order_id' => $order->id]);
                $coupon->increment('used_count');
            }

            if ($loyaltyPointsRedeemed > 0) {
                $this->loyaltyService->debit($user, $loyaltyPointsRedeemed, $order);
            }

            OrderStatusHistory::create(['order_id' => $order->id, 'status' => 'pending', 'changed_by' => $user->id]);

            $cart->items()->delete();
            $cart->delete();

            return $order;
        });

        broadcast(new NewOrderReceived($order));
        SendOrderConfirmationEmail::dispatch($order);

        // Notify the restaurant owner so the owner panel can react instantly,
        // even on devices/panels that do not have the websocket channel open.
        $owner = $restaurant->user;
        if ($owner && $owner->id !== $user->id) {
            $this->notificationService->send(
                $owner,
                'new_order',
                "New Order — {$order->order_number}",
                'New order of ₹'.number_format((float) $order->total_amount, 2).' received.',
                ['order_id' => $order->id, 'status' => $order->status]
            );
        }

        return $order;
    }

    /** @return array{total_amount: float, subtotal: float, delivery_fee: float, discount_amount: float, loyalty_discount_amount: float, loyalty_points_redeemed: int, tax_amount: float} */
    public function quoteFromCart(Request $request): array
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->with('items')->firstOrFail();

        if ($cart->items->isEmpty()) {
            abort(422, 'Cart is empty.');
        }

        $restaurant = Restaurant::findOrFail($cart->restaurant_id);
        $subtotal = (float) $cart->items->sum(fn ($item) => $item->unit_price * $item->quantity);

        if ($subtotal < $restaurant->min_order_amount) {
            abort(422, "Minimum order amount is ₹{$restaurant->min_order_amount}.");
        }

        $coupon = null;
        $discountAmount = 0;
        if ($request->coupon_code) {
            $coupon = $this->validateCoupon($request->coupon_code, $user, $restaurant, $subtotal);
            $discountAmount = $coupon->type === 'percentage'
                ? min($subtotal * $coupon->value / 100, $coupon->max_discount ?? PHP_INT_MAX)
                : min((float) $coupon->value, $subtotal);
            $discountAmount = round($discountAmount, 2);
        }

        $loyaltyDiscount = 0;
        $loyaltyPointsRedeemed = 0;
        if (! $coupon && $request->loyalty_points > 0) {
            [$loyaltyDiscount, $loyaltyPointsRedeemed] = $this->loyaltyService->calculateRedemption(
                $user, (int) $request->loyalty_points, $subtotal
            );
        }

        $taxableAmount = max(0, $subtotal - $discountAmount - $loyaltyDiscount);
        $taxAmount = round($taxableAmount * (float) PlatformSetting::get('tax_rate_pct', 5) / 100, 2);

        return [
            'subtotal' => $subtotal,
            'delivery_fee' => (float) $restaurant->delivery_fee,
            'discount_amount' => $discountAmount,
            'loyalty_discount_amount' => $loyaltyDiscount,
            'loyalty_points_redeemed' => $loyaltyPointsRedeemed,
            'tax_amount' => $taxAmount,
            'total_amount' => round($taxableAmount + (float) $restaurant->delivery_fee + $taxAmount, 2),
        ];
    }

    public function updateStatus(Order $order, string $newStatus, User $changedBy, ?string $note = null): Order
    {
        $order = DB::transaction(function () use ($order, $newStatus, $changedBy, $note) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            $this->ensureValidTransition($order, $newStatus);

            $attributes = ['status' => $newStatus];
            if ($newStatus === 'delivered') {
                $attributes['delivered_at'] = now();
            }
            $order->update($attributes);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $newStatus,
                'changed_by' => $changedBy->id,
                'note' => $note,
            ]);

            if ($newStatus === 'delivered') {
                $this->loyaltyService->credit($order);
                $this->earningsService->recordDeliveryEarning($order);
            }

            return $order->fresh();
        });

        broadcast(new OrderStatusChanged($order));
        SendOrderStatusEmail::dispatch($order);

        if ($message = self::STATUS_MESSAGES[$newStatus] ?? null) {
            $restaurantName = $order->restaurant?->name ?? 'The restaurant';
            $body = $newStatus === 'confirmed' || $newStatus === 'preparing' || $newStatus === 'ready_for_pickup'
                ? "{$restaurantName} {$message['body']}"
                : $message['body'];

            $this->notificationService->send(
                $order->user,
                'order_status',
                "{$message['title']} — {$order->order_number}",
                $body,
                ['order_id' => $order->id, 'status' => $newStatus]
            );
        }

        return $order;
    }

    public function ensureValidTransition(Order $order, string $newStatus): void
    {
        if (! $order->canTransitionTo($newStatus)) {
            throw new UnprocessableEntityHttpException(
                "Order cannot transition from {$order->status} to {$newStatus}."
            );
        }
    }

    public function generateOrderNumber(): string
    {
        return 'ORD-'.now()->format('Ymd').'-'.str_pad(
            (string) (Order::whereDate('created_at', today())->count() + 1), 4, '0', STR_PAD_LEFT
        );
    }

    private function validateCoupon(string $code, User $user, Restaurant $restaurant, float $subtotal): Coupon
    {
        $coupon = Coupon::where('code', $code)->where('is_active', true)->first();

        if (! $coupon) {
            abort(422, 'Invalid coupon code.');
        }

        if (! now()->between($coupon->valid_from, $coupon->valid_until)) {
            abort(422, 'This coupon has expired.');
        }

        if ($coupon->restaurant_id && $coupon->restaurant_id !== $restaurant->id) {
            abort(422, 'This coupon is not valid for this restaurant.');
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            abort(422, 'This coupon has reached its usage limit.');
        }

        $userUsageCount = CouponUsage::where('coupon_id', $coupon->id)->where('user_id', $user->id)->count();

        if ($userUsageCount >= $coupon->per_user_limit) {
            abort(422, 'You have already used this coupon.');
        }

        if ($subtotal < $coupon->min_order_amount) {
            abort(422, "Minimum order amount for this coupon is ₹{$coupon->min_order_amount}.");
        }

        return $coupon;
    }
}
