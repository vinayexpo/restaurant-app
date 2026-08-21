<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Favourite;
use App\Models\Restaurant;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavouriteController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $favourites = Favourite::where('user_id', $request->user()->id)
            ->with('restaurant')
            ->latest()
            ->get();

        return $this->success($favourites);
    }

    public function store(Request $request, int $restaurantId): JsonResponse
    {
        Restaurant::findOrFail($restaurantId);

        $favourite = Favourite::firstOrCreate([
            'user_id' => $request->user()->id,
            'restaurant_id' => $restaurantId,
        ]);

        return $this->success($favourite, 'Added to favourites.', 201);
    }

    public function destroy(Request $request, int $restaurantId): JsonResponse
    {
        Favourite::where('user_id', $request->user()->id)
            ->where('restaurant_id', $restaurantId)
            ->delete();

        return $this->success(null, 'Removed from favourites.');
    }
}
