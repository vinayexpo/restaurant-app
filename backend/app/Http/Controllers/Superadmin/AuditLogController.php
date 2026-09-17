<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name,email')->latest();

        $filters = $request->validate([
            'action' => 'nullable|string|max:100',
            'search' => 'nullable|string|max:100',
            'target_type' => 'nullable|string|max:255',
            'target' => 'nullable|string|max:100',
            'user_id' => 'nullable|integer|exists:users,id',
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d',
        ]);

        if ($action = $filters['action'] ?? null) {
            $query->where('action', 'LIKE', "%{$action}%");
        }

        if ($targetType = $filters['target_type'] ?? null) {
            $query->where('target_type', $targetType);
        }

        if ($userId = $filters['user_id'] ?? null) {
            $query->where('user_id', $userId);
        }

        if ($from = $filters['date_from'] ?? null) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $filters['date_to'] ?? null) {
            $query->whereDate('created_at', '<=', $to);
        }

        if ($target = $filters['target'] ?? null) {
            $query->where(fn ($query) => $query
                ->where('target_type', 'LIKE', "%{$target}%")
                ->orWhere('target_id', 'LIKE', "%{$target}%"));
        }

        if ($search = $filters['search'] ?? null) {
            $query->where(function ($query) use ($search) {
                $query->where('action', 'LIKE', "%{$search}%")
                    ->orWhere('target_type', 'LIKE', "%{$search}%")
                    ->orWhere('target_id', 'LIKE', "%{$search}%")
                    ->orWhereHas('user', fn ($userQuery) => $userQuery
                        ->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%"));
            });
        }

        return $this->paginated($query->paginate(25));
    }
}
