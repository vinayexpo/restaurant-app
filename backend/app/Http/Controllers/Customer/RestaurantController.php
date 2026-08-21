<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\RestaurantHour;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Restaurant::query()->where('is_active', true);

        if ($city = $request->query('city')) {
            $query->where('city', $city);
        }

        if ($cuisine = $request->query('cuisine_type')) {
            $query->whereJsonContains('cuisine_types', $cuisine);
        }

        if ($request->boolean('is_veg')) {
            $query->whereHas('menuItems', fn ($q) => $q->where('is_veg', true)->where('is_available', true));
        }

        if ($minRating = $request->query('min_rating')) {
            $query->where('avg_rating', '>=', (float) $minRating);
        }

        match ($request->query('sort')) {
            'rating' => $query->orderByDesc('avg_rating'),
            'delivery_fee' => $query->orderBy('delivery_fee'),
            'distance' => $this->orderByDistance($query, $request),
            default => $query->orderByDesc('is_featured')->orderByDesc('avg_rating'),
        };

        $restaurants = $query->paginate(15);

        return $this->paginated($restaurants);
    }

    public function featured(): JsonResponse
    {
        $restaurants = Restaurant::where('is_active', true)
            ->where('is_featured', true)
            ->orderByDesc('avg_rating')
            ->limit(10)
            ->get();

        return $this->success($restaurants);
    }

    public function search(Request $request): JsonResponse
    {
        $q = $request->validate(['q' => 'required|string|min:1|max:80'])['q'];

        $restaurants = Restaurant::where('is_active', true)
            ->where(function ($query) use ($q) {
                $query->where('name', 'LIKE', "%{$q}%")
                    ->orWhereJsonContains('cuisine_types', $q);
            })
            ->paginate(15);

        return $this->paginated($restaurants);
    }

    public function autocomplete(Request $request): JsonResponse
    {
        $q = $request->validate(['q' => 'required|string|min:1|max:80'])['q'];

        $results = Restaurant::where('is_active', true)
            ->where('name', 'LIKE', "%{$q}%")
            ->select('id', 'name', 'slug', 'logo', 'cuisine_types', 'avg_rating')
            ->limit(8)
            ->get();

        return $this->success($results);
    }

    public function show(string $slug): JsonResponse
    {
        $restaurant = Restaurant::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $restaurant->setAttribute('is_open', RestaurantHour::isOpenNow($restaurant->id, $restaurant));

        return $this->success($restaurant);
    }

    private function orderByDistance($query, Request $request): void
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');

        if (! $lat || ! $lng) {
            $query->orderByDesc('avg_rating');

            return;
        }

        $query->selectRaw(
            '*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
            [$lat, $lng, $lat]
        )->orderBy('distance');
    }
}
