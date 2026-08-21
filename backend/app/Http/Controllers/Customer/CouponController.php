<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponse;

    public function validateCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $cart = Cart::with('items')->where('user_id', $request->user()->id)->first();

        if (! $cart || $cart->items->isEmpty()) {
            return $this->error('Your cart is empty.', [], 422);
        }

        $coupon = Coupon::where('code', $validated['code'])->where('is_active', true)->first();

        if (! $coupon) {
            return $this->error('Invalid coupon code.', [], 422);
        }

        if (! now()->between($coupon->valid_from, $coupon->valid_until)) {
            return $this->error('This coupon has expired.', [], 422);
        }

        if ($coupon->restaurant_id && $coupon->restaurant_id !== $cart->restaurant_id) {
            return $this->error('This coupon is not valid for this restaurant.', [], 422);
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return $this->error('This coupon has reached its usage limit.', [], 422);
        }

        $userUsageCount = CouponUsage::where('coupon_id', $coupon->id)
            ->where('user_id', $request->user()->id)
            ->count();

        if ($userUsageCount >= $coupon->per_user_limit) {
            return $this->error('You have already used this coupon.', [], 422);
        }

        $subtotal = $cart->items->sum(fn ($item) => $item->unit_price * $item->quantity);

        if ($subtotal < $coupon->min_order_amount) {
            return $this->error("Minimum order amount for this coupon is ₹{$coupon->min_order_amount}.", [], 422);
        }

        $discount = $coupon->type === 'percentage'
            ? round($subtotal * $coupon->value / 100, 2)
            : (float) $coupon->value;

        if ($coupon->max_discount !== null) {
            $discount = min($discount, (float) $coupon->max_discount);
        }

        $discount = min($discount, $subtotal);

        return $this->success([
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discount_amount' => $discount,
        ], 'Coupon applied successfully.');
    }
}
