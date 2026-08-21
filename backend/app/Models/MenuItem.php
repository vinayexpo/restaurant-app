<?php

namespace App\Models;

use App\Traits\HasRestaurantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class MenuItem extends Model
{
    use HasFactory, HasRestaurantScope, SoftDeletes;

    protected $fillable = [
        'restaurant_id', 'category_id', 'name', 'slug', 'description', 'price',
        'discounted_price', 'image', 'is_veg', 'is_available', 'is_featured',
        'preparation_time', 'calories', 'tags',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'is_veg' => 'boolean',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'price' => 'decimal:2',
            'discounted_price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (MenuItem $item) {
            if (! $item->slug) {
                $item->slug = Str::slug($item->name).'-'.Str::random(6);
            }
        });
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(MenuItemVariant::class);
    }
}
