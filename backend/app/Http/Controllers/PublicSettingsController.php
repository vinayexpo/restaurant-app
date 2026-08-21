<?php

namespace App\Http\Controllers;

use App\Models\PlatformSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PublicSettingsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success([
            'loyalty_enabled' => PlatformSetting::get('loyalty_enabled', true),
            'loyalty_earn_rate' => PlatformSetting::get('loyalty_earn_rate', 10),
            'loyalty_redeem_rate' => PlatformSetting::get('loyalty_redeem_rate', 0.10),
            'loyalty_min_redeem' => PlatformSetting::get('loyalty_min_redeem', 100),
            'reviews_enabled' => PlatformSetting::get('reviews_enabled', true),
            'coupons_enabled' => PlatformSetting::get('coupons_enabled', true),
            'delivery_partner_enabled' => PlatformSetting::get('delivery_partner_enabled', true),
            'maintenance_mode' => PlatformSetting::get('maintenance_mode', false),
            'tax_rate_pct' => PlatformSetting::get('tax_rate_pct', 5),
        ]);
    }
}
