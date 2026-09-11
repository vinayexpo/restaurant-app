<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyTier;
use App\Models\LoyaltyTransaction;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Services\LoyaltyService;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoyaltyManageController extends Controller
{
    use ApiResponse;

    public function __construct(
        private NotificationService $notificationService,
        private LoyaltyService $loyaltyService,
    ) {}

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

    public function storeTier(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:loyalty_tiers,name',
            'min_lifetime_points' => 'required|integer|min:0',
            'points_multiplier' => 'required|numeric|min:0.1',
            'free_delivery' => 'sometimes|boolean',
            'free_delivery_min' => 'nullable|numeric|min:0',
            'badge_color' => 'required|regex:/^#[0-9A-Fa-f]{6}$/',
            'perks' => 'nullable|array',
            'perks.*' => 'string|max:255',
        ]);

        $tier = LoyaltyTier::create($validated);

        return $this->success($tier, 'Tier created successfully.', 201);
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

    public function destroyTier(int $id): JsonResponse
    {
        $tier = LoyaltyTier::findOrFail($id);

        if (LoyaltyTier::count() === 1) {
            return $this->error('At least one loyalty tier must remain.', [], 422);
        }

        if ($tier->loyaltyPoints()->exists()) {
            return $this->error('Reassign customers from this tier before deleting it.', [], 422);
        }

        $tier->delete();

        return $this->success(null, 'Tier deleted successfully.');
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
            $loyaltyPoint = $this->loyaltyService->pointsFor($user);

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

        $this->notificationService->send(
            $user,
            'promo',
            'Bonus loyalty points received!',
            "You received {$validated['points']} bonus loyalty points: {$validated['reason']}"
        );

        return $this->success($transaction, 'Bonus points granted.', 201);
    }
}
