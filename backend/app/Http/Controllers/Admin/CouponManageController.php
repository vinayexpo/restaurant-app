<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponManageController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $query = Coupon::whereNull('restaurant_id');

        if ($search = $filters['search'] ?? null) {
            $query->where(fn ($query) => $query
                ->where('code', 'LIKE', "%{$search}%")
                ->orWhere('title', 'LIKE', "%{$search}%"));
        }

        if (array_key_exists('is_active', $filters)) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);
        $coupon = Coupon::create($validated);

        return $this->success($coupon, 'Coupon created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::whereNull('restaurant_id')->findOrFail($id);
        $coupon->update($this->validated($request, sometimes: true));

        return $this->success($coupon->fresh(), 'Coupon updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        Coupon::whereNull('restaurant_id')->findOrFail($id)->delete();

        return $this->success(null, 'Coupon deleted successfully.');
    }

    private function validated(Request $request, bool $sometimes = false): array
    {
        $rule = fn (string $rules) => $sometimes ? 'sometimes|'.$rules : $rules;
        $id = $request->route('id');

        return $request->validate([
            'code' => [$sometimes ? 'sometimes' : 'required', 'string', 'max:50', 'unique:coupons,code'.($id ? ','.$id : '')],
            'title' => $rule('required|string|max:100'),
            'description' => 'nullable|string',
            'type' => $rule('required|in:percentage,fixed'),
            'value' => $rule('required|numeric|min:0'),
            'min_order_amount' => 'sometimes|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'sometimes|integer|min:1',
            'valid_from' => $rule('required|date'),
            'valid_until' => $rule('required|date|after:valid_from'),
            'is_active' => 'sometimes|boolean',
        ]);
    }
}
