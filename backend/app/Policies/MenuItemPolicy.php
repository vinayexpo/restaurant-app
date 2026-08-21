<?php

namespace App\Policies;

use App\Models\MenuItem;
use App\Models\User;

class MenuItemPolicy
{
    public function view(User $user, MenuItem $menuItem): bool
    {
        return $this->owns($user, $menuItem);
    }

    public function create(User $user): bool
    {
        return $user->isRestaurantOwner() && $user->restaurant !== null;
    }

    public function update(User $user, MenuItem $menuItem): bool
    {
        return $this->owns($user, $menuItem);
    }

    public function delete(User $user, MenuItem $menuItem): bool
    {
        return $this->owns($user, $menuItem);
    }

    private function owns(User $user, MenuItem $menuItem): bool
    {
        return $user->isRestaurantOwner()
            && $user->restaurant?->id === $menuItem->restaurant_id;
    }
}
