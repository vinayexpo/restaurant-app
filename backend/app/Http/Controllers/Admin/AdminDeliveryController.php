<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPartner;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDeliveryController extends Controller
{
    use ApiResponse;

    public function __construct(private NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        $query = DeliveryPartner::with('user:id,name,email,phone');

        $filters = $request->validate([
            'is_verified' => 'nullable|boolean',
            'search' => 'nullable|string|max:100',
        ]);

        if (array_key_exists('is_verified', $filters)) {
            $query->where('is_verified', $request->boolean('is_verified'));
        }

        if ($search = $filters['search'] ?? null) {
            $query->whereHas('user', fn ($userQuery) => $userQuery
                ->where('name', 'LIKE', "%{$search}%")
                ->orWhere('email', 'LIKE', "%{$search}%")
                ->orWhere('phone', 'LIKE', "%{$search}%"));
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function verify(int $id): JsonResponse
    {
        $partner = DeliveryPartner::findOrFail($id);
        $partner->update(['is_verified' => true]);

        $this->notificationService->send(
            $partner->user,
            'system',
            'Delivery account verified!',
            'Your delivery partner account is verified. Go online to start accepting orders.'
        );

        return $this->success($partner->fresh(), 'Delivery partner verified.');
    }

    public function suspend(int $id): JsonResponse
    {
        $partner = DeliveryPartner::findOrFail($id);
        $partner->update(['is_verified' => false, 'is_available' => false]);

        return $this->success($partner->fresh(), 'Delivery partner suspended.');
    }
}
