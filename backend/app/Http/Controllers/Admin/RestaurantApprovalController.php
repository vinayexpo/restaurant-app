<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\RestaurantApproved;
use App\Mail\RestaurantRejected;
use App\Models\Restaurant;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class RestaurantApprovalController extends Controller
{
    use ApiResponse;

    public function __construct(private NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Restaurant::with('user:id,name,email');

        match ($request->query('status')) {
            'pending' => $query->where('is_active', false)->whereNull('rejection_reason'),
            'approved' => $query->where('is_active', true),
            'suspended' => $query->where('is_active', false)->whereNotNull('rejection_reason'),
            default => null,
        };

        return $this->paginated($query->latest()->paginate(15));
    }

    public function show(int $id): JsonResponse
    {
        $restaurant = Restaurant::with('user:id,name,email,phone')->findOrFail($id);

        return $this->success($restaurant);
    }

    public function approve(int $id): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update(['is_active' => true, 'is_verified' => true, 'rejection_reason' => null]);

        $this->notificationService->send(
            $restaurant->user,
            'system',
            'Restaurant Approved!',
            "Your restaurant \"{$restaurant->name}\" has been approved and is now live."
        );

        Mail::to($restaurant->email)->queue(new RestaurantApproved($restaurant));

        return $this->success($restaurant->fresh(), 'Restaurant approved.');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($id);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $restaurant->update(['is_active' => false, 'rejection_reason' => $validated['rejection_reason']]);

        $this->notificationService->send(
            $restaurant->user,
            'system',
            'Restaurant Application Rejected',
            "Your restaurant \"{$restaurant->name}\" application was rejected: {$validated['rejection_reason']}"
        );

        Mail::to($restaurant->email)->queue(new RestaurantRejected($restaurant->fresh()));

        return $this->success($restaurant->fresh(), 'Restaurant rejected.');
    }

    public function suspend(Request $request, int $id): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $restaurant->update([
            'is_active' => false,
            'rejection_reason' => $validated['reason'] ?? 'Suspended by admin.',
        ]);

        return $this->success($restaurant->fresh(), 'Restaurant suspended.');
    }

    public function toggleFeatured(int $id): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update(['is_featured' => ! $restaurant->is_featured]);

        return $this->success($restaurant->fresh(), 'Featured status updated.');
    }
}
