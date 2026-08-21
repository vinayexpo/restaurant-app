<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestaurantHour extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'restaurant_id', 'day_of_week', 'opening_time', 'closing_time', 'is_closed',
    ];

    protected function casts(): array
    {
        return [
            'is_closed' => 'boolean',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public static function isOpenNow(int $restaurantId, Restaurant $restaurant): bool
    {
        $today = now()->dayOfWeek;
        $hours = static::where('restaurant_id', $restaurantId)->where('day_of_week', $today)->first();

        if ($hours) {
            if ($hours->is_closed) {
                return false;
            }

            return now()->between(
                now()->setTimeFromTimeString($hours->opening_time),
                now()->setTimeFromTimeString($hours->closing_time)
            );
        }

        return now()->between(
            now()->setTimeFromTimeString($restaurant->opening_time),
            now()->setTimeFromTimeString($restaurant->closing_time)
        );
    }
}
