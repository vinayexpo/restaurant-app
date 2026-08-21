<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Restaurant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'slug', 'description', 'address', 'city', 'state', 'pincode',
        'latitude', 'longitude', 'phone', 'email', 'logo', 'cover_image', 'cuisine_types',
        'opening_time', 'closing_time', 'is_open', 'min_order_amount', 'delivery_fee',
        'avg_delivery_time', 'is_active', 'is_verified', 'is_featured', 'rejection_reason',
        'fssai_number', 'gst_number',
    ];

    protected function casts(): array
    {
        return [
            'cuisine_types' => 'array',
            'is_open' => 'boolean',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'is_featured' => 'boolean',
            'min_order_amount' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'avg_rating' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Restaurant $restaurant) {
            if (! $restaurant->slug) {
                $base = Str::slug($restaurant->name);
                $slug = $base;
                $i = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$base}-{$i}";
                    $i++;
                }
                $restaurant->slug = $slug;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function hours(): HasMany
    {
        return $this->hasMany(RestaurantHour::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class);
    }

    public function commission(): HasMany
    {
        return $this->hasMany(PlatformCommission::class);
    }
}
