<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\RestaurantHour;
use App\Services\ImageService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RestaurantManageController extends Controller
{
    use ApiResponse;

    public function __construct(private ImageService $imageService) {}

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->restaurant) {
            return $this->error('You already have a restaurant registered.', [], 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'pincode' => 'required|string|max:10',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'phone' => 'required|string|max:15',
            'email' => 'required|email',
            'cuisine_types' => 'required|array|min:1',
            'cuisine_types.*' => 'string',
            'opening_time' => 'required',
            'closing_time' => 'required',
            'min_order_amount' => 'nullable|numeric|min:0',
            'delivery_fee' => 'nullable|numeric|min:0',
            'avg_delivery_time' => 'nullable|integer|min:5',
            'fssai_number' => 'required|string|max:50',
            'gst_number' => 'nullable|string|max:20',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $restaurant = DB::transaction(function () use ($validated, $user, $request) {
            if (! empty($validated['logo'])) {
                $validated['logo'] = $this->imageService->storeWebP($request->file('logo'), 'restaurants');
            }

            $restaurant = Restaurant::create([...$validated, 'user_id' => $user->id, 'is_active' => false]);

            $user->update(['role' => 'restaurant_owner']);

            return $restaurant;
        });

        return $this->success($restaurant, 'Restaurant submitted for approval.', 201);
    }

    public function show(Request $request): JsonResponse
    {
        return $this->success($request->get('restaurant'));
    }

    public function update(Request $request): JsonResponse
    {
        $restaurant = $request->get('restaurant');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'address' => 'sometimes|string|max:500',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'pincode' => 'sometimes|string|max:10',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'phone' => 'sometimes|string|max:15',
            'email' => 'sometimes|email',
            'cuisine_types' => 'sometimes|array|min:1',
            'cuisine_types.*' => 'string',
            'opening_time' => 'sometimes',
            'closing_time' => 'sometimes',
            'is_open' => 'sometimes|boolean',
            'min_order_amount' => 'sometimes|numeric|min:0',
            'delivery_fee' => 'sometimes|numeric|min:0',
            'avg_delivery_time' => 'sometimes|integer|min:5',
            'gst_number' => 'nullable|string|max:20',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $this->imageService->storeWebP($request->file('logo'), 'restaurants');
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $this->imageService->storeWebP($request->file('cover_image'), 'restaurants');
        }

        $restaurant->update($validated);

        return $this->success($restaurant->fresh(), 'Restaurant updated successfully.');
    }

    public function hours(Request $request): JsonResponse
    {
        $hours = RestaurantHour::where('restaurant_id', $request->get('restaurant')->id)
            ->orderBy('day_of_week')
            ->get();

        return $this->success($hours);
    }

    public function updateHours(Request $request): JsonResponse
    {
        $restaurant = $request->get('restaurant');

        $validated = $request->validate([
            'hours' => 'required|array|size:7',
            'hours.*.day_of_week' => 'required|integer|between:0,6',
            'hours.*.opening_time' => 'required',
            'hours.*.closing_time' => 'required',
            'hours.*.is_closed' => 'sometimes|boolean',
        ]);

        DB::transaction(function () use ($validated, $restaurant) {
            foreach ($validated['hours'] as $day) {
                RestaurantHour::updateOrCreate(
                    ['restaurant_id' => $restaurant->id, 'day_of_week' => $day['day_of_week']],
                    [
                        'opening_time' => $day['opening_time'],
                        'closing_time' => $day['closing_time'],
                        'is_closed' => $day['is_closed'] ?? false,
                    ]
                );
            }
        });

        return $this->success(
            RestaurantHour::where('restaurant_id', $restaurant->id)->orderBy('day_of_week')->get(),
            'Operating hours updated.'
        );
    }
}
