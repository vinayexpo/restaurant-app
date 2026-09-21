<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPartner;
use App\Models\DeliveryPayoutAccount;
use App\Services\DeliveryPayoutService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryPayoutController extends Controller
{
    use ApiResponse;

    public function __construct(private DeliveryPayoutService $payoutService) {}

    public function account(Request $request): JsonResponse
    {
        $account = $this->partner($request)->payoutAccounts()->where('is_active', true)->latest()->first();

        return $this->success($account ? $this->accountData($account) : null);
    }

    public function storeAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:bank_account,upi',
            'account_holder_name' => 'required_if:type,bank_account|nullable|string|max:255',
            'account_number' => 'required_if:type,bank_account|nullable|string|min:6|max:34',
            'ifsc_code' => ['required_if:type,bank_account', 'nullable', 'regex:/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/'],
            'upi_id' => 'required_if:type,upi|nullable|string|max:255',
        ]);
        $partner = $this->partner($request);

        $partner->payoutAccounts()->where('is_active', true)->update(['is_active' => false]);
        $account = $partner->payoutAccounts()->create($validated + ['is_active' => true]);

        return $this->success($this->accountData($account), 'Payout account saved.', 201);
    }

    public function destroyAccount(Request $request): JsonResponse
    {
        $account = $this->partner($request)->payoutAccounts()->where('is_active', true)->latest()->first();

        if (! $account) {
            return $this->error('No active payout account found.', [], 404);
        }

        if ($account->payouts()->exists()) {
            $account->update(['is_active' => false]);

            return $this->success(null, 'Payout account deactivated. Its payout history has been retained.');
        }

        $account->delete();

        return $this->success(null, 'Payout account removed.');
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => 'nullable|string|in:requested,processing,paid,rejected,failed',
            'search' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $payouts = $this->partner($request)->payouts()
            ->with('payoutAccount:id,type,account_holder_name')
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('provider_payout_id', 'like', "%{$search}%"))
            ->when($filters['date_from'] ?? null, fn ($query, $from) => $query->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn ($query, $to) => $query->whereDate('created_at', '<=', $to))
            ->latest()->paginate(15);

        return $this->paginated($payouts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payout_account_id' => 'required|integer',
            'earning_ids' => 'required|array|min:1|max:100',
            'earning_ids.*' => 'required|integer|distinct',
        ]);
        $partner = $this->partner($request);
        $account = $partner->payoutAccounts()->where('is_active', true)->findOrFail($validated['payout_account_id']);
        $payout = $this->payoutService->request($partner, $account, $validated['earning_ids']);

        return $this->success($payout->load('payoutAccount:id,type,account_holder_name'), 'Payout requested.', 201);
    }

    private function partner(Request $request): DeliveryPartner
    {
        return DeliveryPartner::where('user_id', $request->user()->id)->firstOrFail();
    }

    private function accountData(DeliveryPayoutAccount $account): array
    {
        return [
            'id' => $account->id,
            'type' => $account->type,
            'account_holder_name' => $account->account_holder_name,
            'summary' => $account->summary(),
        ];
    }
}
