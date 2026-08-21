<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    public function index(int $restaurantId): JsonResponse
    {
        $reviews = Review::where('restaurant_id', $restaurantId)
            ->with('user:id,name,profile_image')
            ->latest()
            ->paginate(15);

        return $this->paginated($reviews);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|integer',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'string',
        ]);

        $order = Order::where('id', $validated['order_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $order) {
            return $this->error('Order not found.', [], 404);
        }

        if ($order->status !== 'delivered') {
            return $this->error('You can only review delivered orders.', [], 422);
        }

        if (Review::where('order_id', $order->id)->exists()) {
            return $this->error('You have already reviewed this order.', [], 422);
        }

        $review = Review::create([
            'order_id' => $order->id,
            'user_id' => $request->user()->id,
            'restaurant_id' => $order->restaurant_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'images' => $validated['images'] ?? null,
        ]);

        $restaurantId = $order->restaurant_id;
        $avg = Review::where('restaurant_id', $restaurantId)->avg('rating');
        $count = Review::where('restaurant_id', $restaurantId)->count();
        $order->restaurant()->update(['avg_rating' => round($avg, 2), 'total_reviews' => $count]);

        return $this->success($review, 'Review submitted.', 201);
    }
}
