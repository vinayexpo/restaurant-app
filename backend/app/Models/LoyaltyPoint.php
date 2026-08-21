<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyPoint extends Model
{
    protected $table = 'loyalty_points';

    protected $fillable = [
        'user_id', 'balance', 'lifetime_earned', 'tier_id', 'tier_updated_at', 'tier_manually_set',
    ];

    protected function casts(): array
    {
        return [
            'tier_updated_at' => 'datetime',
            'tier_manually_set' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tier(): BelongsTo
    {
        return $this->belongsTo(LoyaltyTier::class, 'tier_id');
    }
}
