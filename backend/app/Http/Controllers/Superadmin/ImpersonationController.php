<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    use ApiResponse;

    public function start(Request $request, int $userId): JsonResponse
    {
        $superadmin = $request->user();
        $target = User::findOrFail($userId);

        if ($target->id === $superadmin->id) {
            return $this->error('You cannot impersonate yourself.', [], 422);
        }

        $token = $target->createToken(
            'impersonation',
            ["impersonated_by:{$superadmin->id}"],
            now()->addMinutes(15)
        )->plainTextToken;

        AuditLog::create([
            'user_id' => $superadmin->id,
            'user_role' => $superadmin->role,
            'action' => 'user.impersonate.start',
            'target_type' => User::class,
            'target_id' => $target->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $this->success([
            'token' => $token,
            'user' => $target,
        ], 'Impersonation session started.');
    }

    public function stop(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();
        $abilities = $token->abilities ?? [];

        $impersonatedByAbility = collect($abilities)->first(fn ($a) => str_starts_with($a, 'impersonated_by:'));

        if (! $impersonatedByAbility) {
            return $this->error('This is not an impersonation session.', [], 422);
        }

        $superadminId = (int) str_replace('impersonated_by:', '', $impersonatedByAbility);

        AuditLog::create([
            'user_id' => $superadminId,
            'user_role' => 'superadmin',
            'action' => 'user.impersonate.stop',
            'target_type' => User::class,
            'target_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $token->delete();

        return $this->success(null, 'Impersonation session ended.');
    }
}
