<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeatureFlagController extends Controller
{
    use ApiResponse;

    private const FLAG_KEYS = [
        'loyalty_enabled',
        'reviews_enabled',
        'coupons_enabled',
        'delivery_partner_enabled',
        'registration_enabled',
        'restaurant_registration_enabled',
        'maintenance_mode',
    ];

    public function index(): JsonResponse
    {
        $flags = [];

        foreach (self::FLAG_KEYS as $key) {
            $flags[$key] = PlatformSetting::get($key, false);
        }

        return $this->success($flags);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        if (! in_array($key, self::FLAG_KEYS, true)) {
            return $this->error('Unknown feature flag.', [], 422);
        }

        $validated = $request->validate([
            'value' => 'required|boolean',
        ]);

        PlatformSetting::set($key, $validated['value'] ? 'true' : 'false', 'boolean');

        return $this->success([$key => $validated['value']], 'Feature flag updated.');
    }
}
