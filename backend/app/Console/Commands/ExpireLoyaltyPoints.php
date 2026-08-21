<?php

namespace App\Console\Commands;

use App\Models\LoyaltyPoint;
use App\Models\LoyaltyTransaction;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('app:expire-loyalty-points')]
#[Description('Expires earned loyalty points whose expiry date has passed.')]
class ExpireLoyaltyPoints extends Command
{
    public function handle(): void
    {
        $expiring = LoyaltyTransaction::where('type', 'earned')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->whereNull('expired_at')
            ->get()
            ->groupBy('user_id');

        $totalExpired = 0;

        foreach ($expiring as $userId => $transactions) {
            $points = (int) $transactions->sum('points');

            if ($points <= 0) {
                continue;
            }

            DB::transaction(function () use ($userId, $points, $transactions) {
                $loyaltyPoint = LoyaltyPoint::where('user_id', $userId)->first();

                if (! $loyaltyPoint) {
                    return;
                }

                $deducted = min($points, $loyaltyPoint->balance);
                $loyaltyPoint->decrement('balance', $deducted);

                LoyaltyTransaction::create([
                    'user_id' => $userId,
                    'type' => 'expired',
                    'points' => -$deducted,
                    'balance_after' => $loyaltyPoint->fresh()->balance,
                    'description' => 'Points expired',
                ]);

                LoyaltyTransaction::whereIn('id', $transactions->pluck('id'))->update(['expired_at' => now()]);
            });

            $totalExpired += $points;
        }

        $this->info("Expired {$totalExpired} loyalty points across {$expiring->count()} users.");
    }
}
