<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    protected $fillable = [
        'order_id', 'requested_by', 'idempotency_key', 'razorpay_payment_id', 'razorpay_refund_id',
        'amount', 'status', 'reason', 'provider_payload', 'processed_at', 'benefits_restored_at',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'provider_payload' => 'array', 'processed_at' => 'datetime', 'benefits_restored_at' => 'datetime'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
