<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManageController extends Controller
{
    use ApiResponse;

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:15',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            ...$validated,
            'role' => 'restaurant_owner',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        return $this->success($user, 'Restaurant owner account created.', 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        $filters = $request->validate([
            'role' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'search' => 'nullable|string|max:100',
        ]);

        if ($role = $filters['role'] ?? null) {
            $query->where('role', $role);
        }

        if (array_key_exists('is_active', $filters)) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($search = $filters['search'] ?? null) {
            $query->where(fn ($q) => $q->where('name', 'LIKE', "%{$search}%")->orWhere('email', 'LIKE', "%{$search}%"));
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with(['restaurant', 'deliveryPartner'])->findOrFail($id);

        return $this->success($user);
    }

    public function activate(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => true]);

        return $this->success($user, 'User activated.');
    }

    public function deactivate(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => false]);

        return $this->success($user, 'User deactivated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return $this->success(null, 'User deleted.');
    }
}
