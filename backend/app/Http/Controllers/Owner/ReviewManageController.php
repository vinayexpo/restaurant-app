<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewManageController extends Controller
{
    use ApiResponse;

    public function __construct(private NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'rating' => 'nullable|integer|between:1,5',
            'replied' => 'nullable|boolean',
            'search' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);
        $query = Review::where('restaurant_id', $request->get('restaurant')->id)
            ->with('user:id,name,profile_image')
            ->latest();

        if ($rating = $filters['rating'] ?? null) {
            $query->where('rating', $rating);
        }
        if (isset($filters['replied'])) {
            $filters['replied'] ? $query->whereNotNull('owner_replied_at') : $query->whereNull('owner_replied_at');
        }
        if ($search = $filters['search'] ?? null) {
            $query->where(function ($review) use ($search) {
                $review->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%"));
            });
        }
        if ($from = $filters['date_from'] ?? null) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $filters['date_to'] ?? null) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $this->paginated($query->paginate(15));
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $review = Review::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);

        $validated = $request->validate([
            'owner_reply' => 'required|string|max:1000',
        ]);

        $review->update([
            'owner_reply' => $validated['owner_reply'],
            'owner_replied_at' => now(),
        ]);

        $this->notificationService->send(
            $review->user,
            'review_reply',
            'The restaurant replied to your review',
            $validated['owner_reply'],
            ['order_id' => $review->order_id, 'restaurant_id' => $review->restaurant_id]
        );

        return $this->success($review->fresh(), 'Reply posted successfully.');
    }

    public function clearReply(Request $request, int $id): JsonResponse
    {
        $review = Review::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);

        $review->update([
            'owner_reply' => null,
            'owner_replied_at' => null,
        ]);

        return $this->success($review->fresh(), 'Reply deleted successfully.');
    }
}
