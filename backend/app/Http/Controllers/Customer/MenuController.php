<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    use ApiResponse;

    public function byRestaurant(int $restaurantId): JsonResponse
    {
        $categories = Category::where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with(['menuItems' => function ($query) {
                $query->where('is_available', true)->with('variants');
            }])
            ->get();

        return $this->success($categories);
    }
}
