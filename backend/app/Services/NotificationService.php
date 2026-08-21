<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Throwable;

class NotificationService
{
    public function __construct(private PushNotificationService $pushNotificationService) {}

    public function send(User $user, string $type, string $title, string $body, array $data = []): Notification
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'data' => $data,
        ]);

        broadcast(new NotificationCreated($notification))->toOthers();

        try {
            $this->pushNotificationService->send($user, $title, $body, $data);
        } catch (Throwable $e) {
            // Push delivery is best-effort and must never break the action that triggered it.
            Log::warning('Push notification send failed', ['error' => $e->getMessage()]);
        }

        return $notification;
    }
}
