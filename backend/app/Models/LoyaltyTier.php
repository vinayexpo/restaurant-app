<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyTier extends Model
{
    protected $fillable = [
        'name', 'min_lifetime_points', 'points_multiplier', 'free_delivery',
        'free_delivery_min', 'badge_color', 'perks',
    ];

    protected function casts(): array
    {
        return [
            'points_multiplier' => 'decimal:2',
            'free_delivery' => 'boolean',
            'free_delivery_min' => 'decimal:2',
            'perks' => 'array',
        ];
    }

    public function loyaltyPoints(): HasMany
    {
        return $this->hasMany(LoyaltyPoint::class, 'tier_id');
    }
}
