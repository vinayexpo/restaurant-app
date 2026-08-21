<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerCouponController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $coupons = Coupon::where('restaurant_id', $request->get('restaurant')->id)
            ->latest()
            ->paginate(15);

        return $this->paginated($coupons);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);

        $coupon = Coupon::create([...$validated, 'restaurant_id' => $request->get('restaurant')->id]);

        return $this->success($coupon, 'Coupon created successfully.', 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);

        return $this->success($coupon);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);

        $validated = $this->validated($request, sometimes: true);
        $coupon->update($validated);

        return $this->success($coupon->fresh(), 'Coupon updated successfully.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);
        $coupon->delete();

        return $this->success(null, 'Coupon deleted successfully.');
    }

    private function validated(Request $request, bool $sometimes = false): array
    {
        $rule = fn (string $rules) => $sometimes ? 'sometimes|'.$rules : $rules;

        return $request->validate([
            'code' => [$sometimes ? 'sometimes' : 'required', 'string', 'max:50', 'unique:coupons,code'.($sometimes ? ','.$request->route('id') : '')],
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
