<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\PlatformCommission;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'restaurant_id' => 'nullable|integer|exists:restaurants,id',
            'restaurant' => 'nullable|string|max:100',
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d',
        ]);

        $query = PlatformCommission::with('restaurant:id,name');

        if ($restaurantId = $filters['restaurant_id'] ?? null) {
            $query->where('restaurant_id', $restaurantId);
        }

        if ($restaurant = $filters['restaurant'] ?? null) {
            $query->whereHas('restaurant', fn ($restaurantQuery) => $restaurantQuery
                ->where('name', 'LIKE', "%{$restaurant}%"));
        }

        if ($from = $filters['date_from'] ?? null) {
            $query->whereDate('effective_from', '>=', $from);
        }

        if ($to = $filters['date_to'] ?? null) {
            $query->whereDate('effective_from', '<=', $to);
        }

        $commissions = $query->latest()->paginate(15);

        return $this->paginated($commissions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|integer|exists:restaurants,id|unique:platform_commissions,restaurant_id',
            'rate_pct' => 'required|numeric|min:0|max:100',
            'effective_from' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $commission = PlatformCommission::create([...$validated, 'created_by' => $request->user()->id]);

        return $this->success($commission, 'Commission override created.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $commission = PlatformCommission::findOrFail($id);

        $validated = $request->validate([
            'rate_pct' => 'sometimes|numeric|min:0|max:100',
            'effective_from' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        $commission->update($validated);

        return $this->success($commission->fresh(), 'Commission updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        PlatformCommission::findOrFail($id)->delete();

        return $this->success(null, 'Commission override removed — restaurant reverts to platform default.');
    }
}
