<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminNotificationController extends Controller
{
    use ApiResponse;

    public function __construct(private NotificationService $notificationService) {}

    public function broadcast(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:1000',
            'target' => ['required', Rule::in(['all', 'customer', 'restaurant_owner', 'delivery_partner', 'user'])],
            'user_id' => 'required_if:target,user|integer|exists:users,id',
            'data' => 'nullable|array',
        ]);

        $query = User::query();

        if ($validated['target'] === 'user') {
            $query->where('id', $validated['user_id']);
        } elseif ($validated['target'] !== 'all') {
            $query->where('role', $validated['target']);
        }

        $count = 0;

        $query->chunk(200, function ($users) use ($validated, &$count) {
            foreach ($users as $user) {
                $this->notificationService->send(
                    $user,
                    'promo',
                    $validated['title'],
                    $validated['body'],
                    $validated['data'] ?? []
                );
                $count++;
            }
        });

        return $this->success(['sent_count' => $count], 'Notification broadcast sent.', 201);
    }
}
