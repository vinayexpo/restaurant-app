<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPayout;
use App\Services\DeliveryPayoutService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryPayoutController extends Controller
{
    use ApiResponse;

    public function __construct(private DeliveryPayoutService $payoutService) {}

    public function index(Request $request): JsonResponse
    {
        $query = DeliveryPayout::with([
            'deliveryPartner.user:id,name,email,phone',
            'payoutAccount:id,type,account_holder_name',
            'earnings:id,delivery_payout_id,order_id,amount_earned',
        ]);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $payout = $this->payoutService->approve(DeliveryPayout::findOrFail($id), $request->user()->id);

        return $this->success($payout, 'Payout submitted to RazorpayX.');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate(['reason' => 'required|string|max:1000']);
        $payout = DeliveryPayout::findOrFail($id);
        $this->payoutService->reject($payout, $validated['reason']);

        return $this->success($payout->fresh(), 'Payout rejected and earnings released.');
    }
}
