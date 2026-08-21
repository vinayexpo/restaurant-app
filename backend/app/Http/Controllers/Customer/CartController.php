<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\MenuItem;
use App\Models\PlatformSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $cart = Cart::with(['restaurant', 'items.menuItem', 'items.variant'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $cart) {
            return $this->success(null);
        }

        return $this->success($this->cartPayload($cart));
    }

    public function storeItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'variant_id' => 'nullable|exists:menu_item_variants,id',
            'quantity' => 'sometimes|integer|min:1|max:20',
        ]);

        $menuItem = MenuItem::with('variants')->findOrFail($validated['menu_item_id']);
        $quantity = $validated['quantity'] ?? 1;

        $variant = null;
        if (! empty($validated['variant_id'])) {
            $variant = $menuItem->variants->firstWhere('id', $validated['variant_id']);
            if (! $variant) {
                return $this->error('Variant does not belong to this menu item.', [], 422);
            }
        }

        $unitPrice = $variant ? $variant->price : ($menuItem->discounted_price ?? $menuItem->price);

        $cart = DB::transaction(function () use ($request, $menuItem, $variant, $validated, $quantity, $unitPrice) {
            $cart = Cart::where('user_id', $request->user()->id)->first();

            if ($cart && $cart->restaurant_id !== $menuItem->restaurant_id) {
                $cart->items()->delete();
                $cart->update(['restaurant_id' => $menuItem->restaurant_id]);
            } elseif (! $cart) {
                $cart = Cart::create([
                    'user_id' => $request->user()->id,
                    'restaurant_id' => $menuItem->restaurant_id,
                ]);
            }

            $existingItem = $cart->items()
                ->where('menu_item_id', $menuItem->id)
                ->where('variant_id', $validated['variant_id'] ?? null)
                ->first();

            if ($existingItem) {
                $existingItem->update(['quantity' => $existingItem->quantity + $quantity]);
            } else {
                $cart->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'variant_id' => $validated['variant_id'] ?? null,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                ]);
            }

            return $cart;
        });

        $cart->load(['restaurant', 'items.menuItem', 'items.variant']);

        return $this->success($this->cartPayload($cart), 'Item added to cart.', 201);
    }

    public function updateItem(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:20',
        ]);

        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $item = $cart->items()->findOrFail($id);
        $item->update(['quantity' => $validated['quantity']]);

        $cart->load(['restaurant', 'items.menuItem', 'items.variant']);

        return $this->success($this->cartPayload($cart), 'Cart item updated.');
    }

    public function destroyItem(Request $request, int $id): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $cart->items()->findOrFail($id)->delete();

        $cart->load(['restaurant', 'items.menuItem', 'items.variant']);

        return $this->success($this->cartPayload($cart), 'Item removed from cart.');
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();
        $cart?->delete();

        return $this->success(null, 'Cart cleared.');
    }

    private function cartPayload(Cart $cart): array
    {
        $subtotal = $cart->items->sum(fn ($item) => $item->unit_price * $item->quantity);
        $deliveryFee = $cart->restaurant?->delivery_fee ?? 0;
        $taxRatePct = PlatformSetting::get('tax_rate_pct', 5);
        $taxAmount = round($subtotal * $taxRatePct / 100, 2);
        $total = round($subtotal + $deliveryFee + $taxAmount, 2);

        return [
            'cart' => $cart,
            'pricing_preview' => [
                'subtotal' => round($subtotal, 2),
                'delivery_fee' => (float) $deliveryFee,
                'tax_amount' => $taxAmount,
                'total' => $total,
            ],
        ];
    }
}
