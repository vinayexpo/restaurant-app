<?php

namespace App\Models;

use App\Traits\HasRestaurantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasRestaurantScope;

    protected $fillable = [
        'order_id', 'user_id', 'restaurant_id', 'rating', 'comment', 'images',
        'owner_reply', 'owner_replied_at',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'owner_replied_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}
