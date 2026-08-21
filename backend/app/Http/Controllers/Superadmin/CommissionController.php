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

    public function index(): JsonResponse
    {
        $commissions = PlatformCommission::with('restaurant:id,name')->latest()->get();

        return $this->success($commissions);
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
