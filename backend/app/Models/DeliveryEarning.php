<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryEarning extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'delivery_partner_id', 'order_id', 'delivery_fee', 'partner_share_pct',
        'amount_earned', 'status', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'delivery_fee' => 'decimal:2',
            'partner_share_pct' => 'decimal:2',
            'amount_earned' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function deliveryPartner(): BelongsTo
    {
        return $this->belongsTo(DeliveryPartner::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
