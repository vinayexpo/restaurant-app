<?php

namespace App\Http\Controllers\Delivery;

use App\Events\DeliveryLocationUpdated;
use App\Http\Controllers\Controller;
use App\Models\DeliveryPartner;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    use ApiResponse;

    public function profile(Request $request): JsonResponse
    {
        $partner = DeliveryPartner::where('user_id', $request->user()->id)->firstOrFail();
        $partner->load('user:id,name,email,phone,profile_image');

        return $this->success($partner);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $partner = DeliveryPartner::where('user_id', $request->user()->id)->firstOrFail();

        $validated = $request->validate([
            'vehicle_type' => 'sometimes|in:bicycle,motorcycle,scooter',
            'vehicle_number' => 'sometimes|string|max:20',
            'licence_number' => 'sometimes|string|max:30',
        ]);

        $userValidated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:15',
            'profile_image' => 'sometimes|nullable|string|max:500',
        ]);

        $partner->update($validated);
        $request->user()->update($userValidated);

        return $this->success($partner->fresh()->load('user'), 'Profile updated successfully.');
    }

    public function toggleAvailability(Request $request): JsonResponse
    {
        $partner = DeliveryPartner::where('user_id', $request->user()->id)->firstOrFail();

        if (! $partner->is_verified) {
            return $this->error('Your account is not yet verified by admin.', [], 403);
        }

        $partner->update(['is_available' => ! $partner->is_available]);

        return $this->success($partner->fresh(), 'Availability updated.');
    }

    public function updateLocation(Request $request): JsonResponse
    {
        $partner = DeliveryPartner::where('user_id', $request->user()->id)->firstOrFail();

        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $partner->update([
            'current_latitude' => $validated['latitude'],
            'current_longitude' => $validated['longitude'],
        ]);

        $activeOrder = Order::where('delivery_partner_id', $request->user()->id)
            ->whereIn('status', ['picked_up', 'on_the_way'])
            ->first();

        if ($activeOrder) {
            broadcast(new DeliveryLocationUpdated($activeOrder, $validated['latitude'], $validated['longitude']))->toOthers();
        }

        return $this->success($partner->fresh());
    }
}
