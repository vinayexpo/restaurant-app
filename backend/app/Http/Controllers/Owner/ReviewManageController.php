<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewManageController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Review::where('restaurant_id', $request->get('restaurant')->id)
            ->with('user:id,name,profile_image')
            ->latest();

        if ($rating = $request->query('rating')) {
            $query->where('rating', $rating);
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

        return $this->success($review->fresh(), 'Reply posted successfully.');
    }
}
