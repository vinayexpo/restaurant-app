<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function reply(User $user, Review $review): bool
    {
        return $user->isRestaurantOwner()
            && $user->restaurant?->id === $review->restaurant_id;
    }
}
