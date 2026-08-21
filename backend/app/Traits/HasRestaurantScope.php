<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasRestaurantScope
{
    public static function bootHasRestaurantScope(): void
    {
        if (app()->has('currentRestaurant')) {
            static::addGlobalScope('restaurant', function (Builder $builder) {
                $builder->where(
                    (new static)->getTable().'.restaurant_id',
                    app('currentRestaurant')->id
                );
            });
        }
    }
}
