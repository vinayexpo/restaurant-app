<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

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

        $review = DB::transaction(function () use ($validated, $request) {
            $order = Order::query()
                ->where('id', $validated['order_id'])
                ->where('user_id', $request->user()->id)
                ->lockForUpdate()
                ->first();

            if (! $order) {
                abort(404, 'Order not found.');
            }

            if ($order->status !== 'delivered') {
                abort(422, 'You can only review delivered orders.');
            }

            if (Review::where('order_id', $order->id)->exists()) {
                abort(422, 'You have already reviewed this order.');
            }

            Restaurant::query()->lockForUpdate()->findOrFail($order->restaurant_id);

            $review = Review::create([
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'restaurant_id' => $order->restaurant_id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
                'images' => $validated['images'] ?? null,
            ]);

            $this->recalculateRestaurantRating($order->restaurant_id);

            return $review;
        });

        return $this->success($review, 'Review submitted.', 201);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        Gate::authorize('update', $review);

        $validated = $request->validate([
            'rating' => 'sometimes|required|integer|between:1,5',
            'comment' => 'sometimes|nullable|string|max:1000',
            'images' => 'sometimes|nullable|array|max:5',
            'images.*' => 'string',
        ]);

        $review = DB::transaction(function () use ($review, $validated) {
            $review = Review::query()->lockForUpdate()->findOrFail($review->id);
            Gate::authorize('update', $review);
            Restaurant::query()->lockForUpdate()->findOrFail($review->restaurant_id);

            $review->update($validated);
            $this->recalculateRestaurantRating($review->restaurant_id);

            return $review;
        });

        return $this->success($review, 'Review updated.');
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        Gate::authorize('delete', $review);

        DB::transaction(function () use ($review) {
            $review = Review::query()->lockForUpdate()->findOrFail($review->id);
            Gate::authorize('delete', $review);
            Restaurant::query()->lockForUpdate()->findOrFail($review->restaurant_id);

            $restaurantId = $review->restaurant_id;
            $review->delete();
            $this->recalculateRestaurantRating($restaurantId);
        });

        return $this->success(null, 'Review deleted.');
    }

    private function recalculateRestaurantRating(int $restaurantId): void
    {
        $statistics = Review::query()
            ->where('restaurant_id', $restaurantId)
            ->selectRaw('AVG(rating) as average_rating, COUNT(*) as review_count')
            ->first();

        Restaurant::query()->findOrFail($restaurantId)->forceFill([
            'avg_rating' => round((float) ($statistics->average_rating ?? 0), 2),
            'total_reviews' => (int) ($statistics->review_count ?? 0),
        ])->save();
    }
}
