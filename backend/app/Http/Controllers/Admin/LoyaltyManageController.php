<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltyTier;
use App\Models\LoyaltyTransaction;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoyaltyManageController extends Controller
{
    use ApiResponse;

    private const CONFIG_KEYS = [
        'loyalty_earn_rate' => 'integer',
        'loyalty_redeem_rate' => 'float',
        'loyalty_min_redeem' => 'integer',
        'loyalty_max_redeem_pct' => 'integer',
        'loyalty_expiry_months' => 'integer',
        'loyalty_enabled' => 'boolean',
    ];

    public function config(): JsonResponse
    {
        $config = [];

        foreach (array_keys(self::CONFIG_KEYS) as $key) {
            $config[$key] = PlatformSetting::get($key);
        }

        return $this->success($config);
    }

    public function updateConfig(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'loyalty_earn_rate' => 'sometimes|integer|min:1',
            'loyalty_redeem_rate' => 'sometimes|numeric|min:0.01',
            'loyalty_min_redeem' => 'sometimes|integer|min:0',
            'loyalty_max_redeem_pct' => 'sometimes|integer|min:1|max:100',
            'loyalty_expiry_months' => 'sometimes|integer|min:0',
            'loyalty_enabled' => 'sometimes|boolean',
        ]);

        foreach ($validated as $key => $value) {
            PlatformSetting::set($key, $value, self::CONFIG_KEYS[$key]);
        }

        return $this->success(null, 'Loyalty configuration updated.');
    }

    public function tiers(): JsonResponse
    {
        return $this->success(LoyaltyTier::orderBy('min_lifetime_points')->get());
    }

    public function updateTier(Request $request, int $id): JsonResponse
    {
        $tier = LoyaltyTier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:50',
            'min_lifetime_points' => 'sometimes|integer|min:0',
            'points_multiplier' => 'sometimes|numeric|min:0.1',
            'free_delivery' => 'sometimes|boolean',
            'free_delivery_min' => 'nullable|numeric|min:0',
            'badge_color' => 'sometimes|string|max:7',
            'perks' => 'nullable|array',
            'perks.*' => 'string',
        ]);

        $tier->update($validated);

        return $this->success($tier->fresh(), 'Tier updated successfully.');
    }

    public function bonus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'points' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
        ]);

        $user = User::findOrFail($validated['user_id']);

        $transaction = DB::transaction(function () use ($validated, $user) {
            $loyaltyPoint = LoyaltyPoint::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'lifetime_earned' => 0, 'tier_id' => 1]
            );

            $loyaltyPoint->increment('balance', $validated['points']);
            $loyaltyPoint->increment('lifetime_earned', $validated['points']);

            return LoyaltyTransaction::create([
                'user_id' => $user->id,
                'type' => 'bonus',
                'points' => $validated['points'],
                'balance_after' => $loyaltyPoint->fresh()->balance,
                'description' => $validated['reason'],
            ]);
        });

        return $this->success($transaction, 'Bonus points granted.', 201);
    }
}
