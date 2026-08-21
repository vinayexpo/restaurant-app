<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryPartner extends Model
{
    protected $fillable = [
        'user_id', 'vehicle_type', 'vehicle_number', 'licence_number', 'current_latitude',
        'current_longitude', 'is_available', 'is_verified', 'total_deliveries', 'avg_rating',
    ];

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
            'is_verified' => 'boolean',
            'current_latitude' => 'decimal:8',
            'current_longitude' => 'decimal:8',
            'avg_rating' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(DeliveryEarning::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(DeliveryPartnerRating::class);
    }
}
