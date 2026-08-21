<?php

namespace Database\Seeders;

use App\Models\PlatformSetting;
use Illuminate\Database\Seeder;

class PlatformSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'loyalty_earn_rate', 'value' => '10', 'cast' => 'integer'],
            ['key' => 'loyalty_redeem_rate', 'value' => '0.10', 'cast' => 'float'],
            ['key' => 'loyalty_min_redeem', 'value' => '100', 'cast' => 'integer'],
            ['key' => 'loyalty_max_redeem_pct', 'value' => '20', 'cast' => 'integer'],
            ['key' => 'loyalty_expiry_months', 'value' => '12', 'cast' => 'integer'],
            ['key' => 'loyalty_enabled', 'value' => 'true', 'cast' => 'boolean'],
            ['key' => 'default_commission_pct', 'value' => '10', 'cast' => 'float'],
            ['key' => 'tax_rate_pct', 'value' => '5', 'cast' => 'float'],
            ['key' => 'delivery_partner_share_pct', 'value' => '80', 'cast' => 'integer'],
            ['key' => 'reviews_enabled', 'value' => 'true', 'cast' => 'boolean'],
            ['key' => 'coupons_enabled', 'value' => 'true', 'cast' => 'boolean'],
            ['key' => 'delivery_partner_enabled', 'value' => 'true', 'cast' => 'boolean'],
            ['key' => 'maintenance_mode', 'value' => 'false', 'cast' => 'boolean'],
        ];

        foreach ($settings as $setting) {
            PlatformSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
