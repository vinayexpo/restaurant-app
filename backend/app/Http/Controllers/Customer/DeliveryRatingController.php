<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPartner;
use App\Models\DeliveryPartnerRating;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryRatingController extends Controller
{
    use ApiResponse;

    public function store(Request $request, int $orderId): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($orderId);

        if ($order->status !== 'delivered') {
            return $this->error('You can only rate delivery after the order is delivered.', [], 422);
        }

        if (! $order->delivery_partner_id) {
            return $this->error('No delivery partner assigned to this order.', [], 422);
        }

        if (DeliveryPartnerRating::where('order_id', $order->id)->exists()) {
            return $this->error('You have already rated this delivery.', [], 422);
        }

        $partner = DeliveryPartner::where('user_id', $order->delivery_partner_id)->firstOrFail();

        $validated = $request->validate([
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:500',
        ]);

        $rating = DeliveryPartnerRating::create([
            'order_id' => $order->id,
            'user_id' => $request->user()->id,
            'delivery_partner_id' => $partner->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        $avg = DeliveryPartnerRating::where('delivery_partner_id', $partner->id)->avg('rating');
        $partner->update(['avg_rating' => round($avg, 2)]);

        return $this->success($rating, 'Rating submitted.', 201);
    }
}
