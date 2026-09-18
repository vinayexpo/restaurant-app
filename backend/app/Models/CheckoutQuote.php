<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckoutQuote extends Model
{
    protected $fillable = ['user_id', 'razorpay_order_id', 'total_amount', 'checkout_data', 'expires_at', 'consumed_at'];

    protected function casts(): array
    {
        return ['total_amount' => 'decimal:2', 'checkout_data' => 'array', 'expires_at' => 'datetime', 'consumed_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
