<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function update(User $user, Review $review): bool
    {
        return $user->isCustomer() && $review->user_id === $user->id;
    }

    public function delete(User $user, Review $review): bool
    {
        return $this->update($user, $review);
    }

    public function reply(User $user, Review $review): bool
    {
        return $user->isRestaurantOwner()
            && $user->restaurant?->id === $review->restaurant_id;
    }
}
