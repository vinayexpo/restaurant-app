<?php

namespace App\Policies;

use App\Models\Coupon;
use App\Models\User;

class CouponPolicy
{
    public function view(User $user, Coupon $coupon): bool
    {
        return $this->owns($user, $coupon);
    }

    public function create(User $user): bool
    {
        return $user->isRestaurantOwner() && $user->restaurant !== null;
    }

    public function update(User $user, Coupon $coupon): bool
    {
        return $this->owns($user, $coupon);
    }

    public function delete(User $user, Coupon $coupon): bool
    {
        return $this->owns($user, $coupon);
    }

    private function owns(User $user, Coupon $coupon): bool
    {
        return $user->isRestaurantOwner()
            && $user->restaurant?->id === $coupon->restaurant_id;
    }
}
