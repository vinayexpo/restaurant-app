<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\LoyaltyTier;
use App\Models\LoyaltyTransaction;
use App\Models\PlatformSetting;
use App\Services\LoyaltyService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LoyaltyController extends Controller
{
    use ApiResponse;

    public function __construct(private LoyaltyService $loyaltyService) {}

    public function summary(Request $request): JsonResponse
    {
        try {
            $loyaltyPoint = $this->loyaltyService->pointsFor($request->user());

            $nextTier = LoyaltyTier::where('min_lifetime_points', '>', $loyaltyPoint->lifetime_earned)
                ->orderBy('min_lifetime_points')
                ->first();

            $nextExpiry = LoyaltyTransaction::where('user_id', $request->user()->id)
                ->where('type', 'earned')
                ->whereNotNull('expires_at')
                ->where('expires_at', '>', now())
                ->orderBy('expires_at')
                ->first();

            return $this->success([
                'balance' => $loyaltyPoint->balance,
                'lifetime_earned' => $loyaltyPoint->lifetime_earned,
                'tier' => $loyaltyPoint->tier,
                'next_tier' => $nextTier,
                'points_to_next_tier' => $nextTier ? max(0, $nextTier->min_lifetime_points - $loyaltyPoint->lifetime_earned) : 0,
                'next_expiry' => $nextExpiry?->expires_at,
            ]);
        } catch (\Throwable $exception) {
            Log::error('Unable to load loyalty summary.', [
                'user_id' => $request->user()->id,
                'exception' => $exception,
            ]);

            return $this->error('Unable to load loyalty information.', [], 500);
        }
    }

    public function transactions(Request $request): JsonResponse
    {
        $transactions = LoyaltyTransaction::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return $this->paginated($transactions);
    }

    public function redeem(Request $request): JsonResponse
    {
        if (! PlatformSetting::get('loyalty_enabled', true)) {
            return $this->error('Loyalty points are currently disabled.', [], 422);
        }

        $validated = $request->validate([
            'points' => 'required|integer|min:1',
        ]);

        $cart = Cart::with('items')->where('user_id', $request->user()->id)->first();

        if (! $cart || $cart->items->isEmpty()) {
            return $this->error('Your cart is empty.', [], 422);
        }

        $subtotal = $cart->items->sum(fn ($item) => $item->unit_price * $item->quantity);

        [$discountAmount, $pointsRedeemed] = $this->loyaltyService->calculateRedemption(
            $request->user(), $validated['points'], $subtotal
        );

        return $this->success([
            'points_redeemed' => $pointsRedeemed,
            'discount_amount' => $discountAmount,
        ]);
    }

    public function tiers(): JsonResponse
    {
        return $this->success(LoyaltyTier::orderBy('min_lifetime_points')->get());
    }
}
