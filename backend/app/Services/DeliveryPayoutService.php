<?php

namespace App\Services;

use App\Models\DeliveryEarning;
use App\Models\DeliveryPartner;
use App\Models\DeliveryPayout;
use App\Models\DeliveryPayoutAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class DeliveryPayoutService
{
    public function request(DeliveryPartner $partner, DeliveryPayoutAccount $account, array $earningIds): DeliveryPayout
    {
        if (! $partner->is_verified) {
            throw ValidationException::withMessages(['payout' => 'Your delivery account must be verified before requesting a payout.']);
        }

        return DB::transaction(function () use ($partner, $account, $earningIds) {
            $earnings = DeliveryEarning::where('delivery_partner_id', $partner->id)
                ->whereIn('id', $earningIds)
                ->where('status', 'pending')
                ->whereNull('delivery_payout_id')
                ->lockForUpdate()
                ->get();

            if ($earnings->count() !== count($earningIds)) {
                throw ValidationException::withMessages([
                    'earning_ids' => 'One or more earnings are no longer available for payout.',
                ]);
            }

            $payout = DeliveryPayout::create([
                'delivery_partner_id' => $partner->id,
                'delivery_payout_account_id' => $account->id,
                'amount' => $earnings->sum('amount_earned'),
            ]);

            DeliveryEarning::whereIn('id', $earnings->pluck('id'))->update(['delivery_payout_id' => $payout->id]);

            return $payout;
        });
    }

    public function approve(DeliveryPayout $payout, int $adminId): DeliveryPayout
    {
        $this->ensureRazorpayXConfigured();

        $payout = DB::transaction(function () use ($payout, $adminId) {
            $payout = DeliveryPayout::lockForUpdate()->findOrFail($payout->id);

            if ($payout->status !== 'requested') {
                throw ValidationException::withMessages(['payout' => 'Only requested payouts can be approved.']);
            }

            $payout->update([
                'status' => 'processing',
                'approved_by' => $adminId,
                'processed_at' => now(),
            ]);

            return $payout;
        });

        try {
            $response = $this->createRazorpayPayout($payout->fresh('payoutAccount.deliveryPartner.user'));
        } catch (\Throwable $exception) {
            report($exception);

            // Keep the payout reserved and processing: an ambiguous provider failure must never permit a duplicate transfer.
            throw ValidationException::withMessages(['payout' => 'Transfer submission could not be confirmed. Check the provider dashboard before retrying.']);
        }

        $providerStatus = $response['status'] ?? null;
        $payout->update([
            'provider_payout_id' => $response['id'] ?? null,
            'provider_status' => $providerStatus,
        ]);

        if (in_array($providerStatus, ['failed', 'reversed'], true)) {
            $this->fail($payout, $response['status_details']['description'] ?? 'The payment provider rejected the payout.');
        }

        return $payout->fresh();
    }

    public function settleFromWebhook(array $entity): void
    {
        $providerId = $entity['id'] ?? null;
        $status = $entity['status'] ?? null;

        if (! $providerId || ! $status) {
            return;
        }

        DB::transaction(function () use ($providerId, $status, $entity) {
            $payout = DeliveryPayout::where('provider_payout_id', $providerId)->lockForUpdate()->first();

            if (! $payout || $payout->status === 'paid') {
                return;
            }

            $payout->update(['provider_status' => $status]);

            if ($status === 'processed') {
                $payout->update(['status' => 'paid', 'paid_at' => now()]);
                DeliveryEarning::where('delivery_payout_id', $payout->id)->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);
            }

            if (in_array($status, ['failed', 'reversed'], true)) {
                $this->fail($payout, $entity['status_details']['description'] ?? 'The payment provider did not complete the payout.');
            }
        });
    }

    public function reject(DeliveryPayout $payout, string $reason): void
    {
        DB::transaction(function () use ($payout, $reason) {
            $payout = DeliveryPayout::lockForUpdate()->findOrFail($payout->id);

            if ($payout->status !== 'requested') {
                throw ValidationException::withMessages(['payout' => 'Only requested payouts can be rejected.']);
            }

            $payout->update(['status' => 'rejected', 'failure_reason' => $reason]);
            DeliveryEarning::where('delivery_payout_id', $payout->id)->update(['delivery_payout_id' => null]);
        });
    }

    private function fail(DeliveryPayout $payout, string $reason): void
    {
        $payout->update(['status' => 'failed', 'failure_reason' => $reason]);
        DeliveryEarning::where('delivery_payout_id', $payout->id)->where('status', 'pending')->update(['delivery_payout_id' => null]);
    }

    private function createRazorpayPayout(DeliveryPayout $payout): array
    {
        $keyId = config('services.razorpay.key_id');
        $keySecret = config('services.razorpay.key_secret');
        $sourceAccount = config('services.razorpayx.account_number');

        $fundAccountId = $this->fundAccountId($payout->payoutAccount, $payout->payoutAccount->deliveryPartner);
        $response = Http::baseUrl('https://api.razorpay.com/v1')
            ->withBasicAuth($keyId, $keySecret)
            ->acceptJson()
            ->post('/payouts', [
                'account_number' => $sourceAccount,
                'fund_account_id' => $fundAccountId,
                'amount' => (int) round((float) $payout->amount * 100),
                'currency' => 'INR',
                'mode' => $payout->payoutAccount->type === 'upi' ? 'UPI' : 'IMPS',
                'purpose' => 'payout',
                'queue_if_low_balance' => true,
                'reference_id' => 'delivery-payout-'.$payout->id,
                'narration' => 'Delivery earnings',
            ])
            ->throw();

        return $response->json();
    }

    private function ensureRazorpayXConfigured(): void
    {
        if (! config('services.razorpay.key_id') || ! config('services.razorpay.key_secret') || ! config('services.razorpayx.account_number')) {
            throw ValidationException::withMessages(['payout' => 'RazorpayX credentials and source account are not configured.']);
        }
    }

    private function fundAccountId(DeliveryPayoutAccount $account, DeliveryPartner $partner): string
    {
        if ($account->provider_fund_account_id) {
            return $account->provider_fund_account_id;
        }

        $user = $partner->user;
        $client = Http::baseUrl('https://api.razorpay.com/v1')
            ->withBasicAuth(config('services.razorpay.key_id'), config('services.razorpay.key_secret'))
            ->acceptJson();
        $contact = $client->post('/contacts', [
            'name' => $user->name,
            'email' => $user->email,
            'contact' => $user->phone,
            'type' => 'vendor',
            'reference_id' => 'delivery-partner-'.$partner->id,
        ])->throw()->json();
        $fundAccount = $client->post('/fund_accounts', [
            'contact_id' => $contact['id'],
            'account_type' => $account->type === 'upi' ? 'vpa' : 'bank_account',
            $account->type === 'upi' ? 'vpa' : 'bank_account' => $account->type === 'upi'
                ? ['address' => $account->upi_id]
                : [
                    'name' => $account->account_holder_name,
                    'ifsc' => $account->ifsc_code,
                    'account_number' => $account->account_number,
                ],
        ])->throw()->json();

        $account->update(['provider_fund_account_id' => $fundAccount['id']]);

        return $fundAccount['id'];
    }
}
