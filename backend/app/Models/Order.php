<?php

namespace App\Models;

use App\Traits\HasRestaurantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory, HasRestaurantScope;

    protected $fillable = [
        'order_number', 'user_id', 'restaurant_id', 'delivery_partner_id', 'delivery_address_id',
        'status', 'payment_status', 'payment_method', 'razorpay_order_id', 'razorpay_payment_id',
        'razorpay_signature', 'subtotal', 'delivery_fee', 'discount_amount', 'tax_amount',
        'total_amount', 'coupon_code', 'loyalty_points_redeemed', 'loyalty_discount_amount',
        'special_instructions', 'estimated_delivery_at', 'delivered_at', 'cancelled_at', 'cancel_reason',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'loyalty_discount_amount' => 'decimal:2',
            'estimated_delivery_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function deliveryPartner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delivery_partner_id');
    }

    public function deliveryAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'delivery_address_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function deliveryRating(): HasOne
    {
        return $this->hasOne(DeliveryPartnerRating::class);
    }

    public function deliveryEarning(): HasOne
    {
        return $this->hasOne(DeliveryEarning::class);
    }
}
