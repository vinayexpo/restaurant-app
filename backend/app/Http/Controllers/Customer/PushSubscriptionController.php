<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    use ApiResponse;

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:1000',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        PushSubscription::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'endpoint_hash' => sha1($validated['endpoint']),
            ],
            [
                'endpoint' => $validated['endpoint'],
                'public_key' => $validated['keys']['p256dh'],
                'auth_token' => $validated['keys']['auth'],
            ]
        );

        return $this->success(null, 'Subscribed to push notifications.');
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate(['endpoint' => 'required|string|max:1000']);

        PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint_hash', sha1($validated['endpoint']))
            ->delete();

        return $this->success(null, 'Unsubscribed from push notifications.');
    }
}
