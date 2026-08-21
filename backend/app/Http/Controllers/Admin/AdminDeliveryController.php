<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPartner;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDeliveryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = DeliveryPartner::with('user:id,name,email,phone');

        if ($request->has('is_verified')) {
            $query->where('is_verified', $request->boolean('is_verified'));
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function verify(int $id): JsonResponse
    {
        $partner = DeliveryPartner::findOrFail($id);
        $partner->update(['is_verified' => true]);

        return $this->success($partner->fresh(), 'Delivery partner verified.');
    }

    public function suspend(int $id): JsonResponse
    {
        $partner = DeliveryPartner::findOrFail($id);
        $partner->update(['is_verified' => false, 'is_available' => false]);

        return $this->success($partner->fresh(), 'Delivery partner suspended.');
    }
}
