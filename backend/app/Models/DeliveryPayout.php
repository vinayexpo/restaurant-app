<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryPayout extends Model
{
    protected $fillable = [
        'delivery_partner_id', 'delivery_payout_account_id', 'amount', 'status', 'approved_by',
        'provider_payout_id', 'provider_status', 'failure_reason', 'processed_at', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'processed_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function deliveryPartner(): BelongsTo
    {
        return $this->belongsTo(DeliveryPartner::class);
    }

    public function payoutAccount(): BelongsTo
    {
        return $this->belongsTo(DeliveryPayoutAccount::class, 'delivery_payout_account_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(DeliveryEarning::class);
    }
}
