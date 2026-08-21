<?php

use App\Models\Order;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
    $order = Order::find($orderId);

    if (! $order) {
        return false;
    }

    return $user->id === $order->user_id
        || $user->id === $order->delivery_partner_id
        || $user->role === 'superadmin'
        || ($user->role === 'restaurant_owner' && $user->restaurant?->id === $order->restaurant_id);
});

Broadcast::channel('restaurant.{restaurantId}.orders', function ($user, $restaurantId) {
    return $user->role === 'restaurant_owner' && (int) $user->restaurant?->id === (int) $restaurantId;
});

Broadcast::channel('delivery.{partnerId}', function ($user, $partnerId) {
    return (int) $user->id === (int) $partnerId;
});
