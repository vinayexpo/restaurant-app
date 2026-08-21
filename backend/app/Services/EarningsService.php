<?php

namespace App\Services;

use App\Models\DeliveryEarning;
use App\Models\DeliveryPartner;
use App\Models\Order;
use App\Models\PlatformSetting;

class EarningsService
{
    public function recordDeliveryEarning(Order $order): void
    {
        if (! $order->delivery_partner_id) {
            return;
        }

        $partner = DeliveryPartner::where('user_id', $order->delivery_partner_id)->first();

        if (! $partner || DeliveryEarning::where('order_id', $order->id)->exists()) {
            return;
        }

        $sharePct = (float) PlatformSetting::get('delivery_partner_share_pct', 80);
        $amountEarned = floor($order->delivery_fee * $sharePct / 100);

        DeliveryEarning::create([
            'delivery_partner_id' => $partner->id,
            'order_id' => $order->id,
            'delivery_fee' => $order->delivery_fee,
            'partner_share_pct' => $sharePct,
            'amount_earned' => $amountEarned,
            'status' => 'pending',
        ]);

        $partner->increment('total_deliveries');
    }
}
