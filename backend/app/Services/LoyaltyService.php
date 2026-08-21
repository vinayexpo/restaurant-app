<?php

namespace App\Services;

use App\Models\LoyaltyPoint;
use App\Models\LoyaltyTier;
use App\Models\LoyaltyTransaction;
use App\Models\Order;
use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    public function __construct(private NotificationService $notificationService) {}

    public function credit(Order $order): void
    {
        if (! PlatformSetting::get('loyalty_enabled', true)) {
            return;
        }

        $user = $order->user;
        $loyaltyPoint = $this->pointsFor($user);

        $earnRate = (float) PlatformSetting::get('loyalty_earn_rate', 10);
        $multiplier = (float) $loyaltyPoint->tier->points_multiplier;
        $points = (int) floor(($order->subtotal / $earnRate) * $multiplier);

        if ($points <= 0) {
            return;
        }

        DB::transaction(function () use ($loyaltyPoint, $points, $order, $user) {
            $loyaltyPoint->increment('balance', $points);
            $loyaltyPoint->increment('lifetime_earned', $points);

            $expiryMonths = (int) PlatformSetting::get('loyalty_expiry_months', 12);

            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'type' => 'earned',
                'points' => $points,
                'balance_after' => $loyaltyPoint->fresh()->balance,
                'description' => "Earned on order #{$order->order_number}",
                'expires_at' => $expiryMonths > 0 ? now()->addMonths($expiryMonths) : null,
            ]);
        });

        $this->recalculateTier($user);
    }

    public function debit(User $user, int $points, Order $order): void
    {
        $loyaltyPoint = $this->pointsFor($user);

        DB::transaction(function () use ($loyaltyPoint, $points, $order, $user) {
            $loyaltyPoint->decrement('balance', $points);

            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'type' => 'redeemed',
                'points' => -$points,
                'balance_after' => $loyaltyPoint->fresh()->balance,
                'description' => "Redeemed on order #{$order->order_number}",
            ]);
        });
    }

    /**
     * @return array{0: float, 1: int} [discountAmount, pointsRedeemed]
     */
    public function calculateRedemption(User $user, int $requestedPoints, float $subtotal): array
    {
        $loyaltyPoint = $this->pointsFor($user);

        $redeemRate = (float) PlatformSetting::get('loyalty_redeem_rate', 0.10);
        $minRedeem = (int) PlatformSetting::get('loyalty_min_redeem', 100);
        $maxRedeemPct = (float) PlatformSetting::get('loyalty_max_redeem_pct', 20);

        $pointsToRedeem = min($requestedPoints, $loyaltyPoint->balance);

        $maxDiscountAllowed = $subtotal * $maxRedeemPct / 100;
        $discountAmount = $pointsToRedeem * $redeemRate;

        if ($discountAmount > $maxDiscountAllowed) {
            $pointsToRedeem = (int) floor($maxDiscountAllowed / $redeemRate);
            $discountAmount = $pointsToRedeem * $redeemRate;
        }

        if ($pointsToRedeem < $minRedeem) {
            abort(422, "A minimum of {$minRedeem} points is required to redeem loyalty points.");
        }

        return [round($discountAmount, 2), $pointsToRedeem];
    }

    public function recalculateTier(User $user): void
    {
        $loyaltyPoint = $this->pointsFor($user);

        if ($loyaltyPoint->tier_manually_set) {
            return;
        }

        $tier = LoyaltyTier::where('min_lifetime_points', '<=', $loyaltyPoint->lifetime_earned)
            ->orderByDesc('min_lifetime_points')
            ->first();

        if ($tier && $tier->id !== $loyaltyPoint->tier_id) {
            $loyaltyPoint->update(['tier_id' => $tier->id, 'tier_updated_at' => now()]);

            $this->notificationService->send(
                $user,
                'system',
                'Tier Upgraded!',
                "You've been upgraded to {$tier->name} tier.",
                ['new_tier' => $tier->name, 'badge_color' => $tier->badge_color]
            );
        }
    }

    private function pointsFor(User $user): LoyaltyPoint
    {
        return LoyaltyPoint::with('tier')->firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'lifetime_earned' => 0, 'tier_id' => 1]
        );
    }
}
