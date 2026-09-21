<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SuperAdminController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $query = User::where('role', 'admin');

        if ($search = $filters['search'] ?? null) {
            $query->where(fn ($query) => $query
                ->where('name', 'LIKE', "%{$search}%")
                ->orWhere('email', 'LIKE', "%{$search}%"));
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function bootstrapStatus(): JsonResponse
    {
        return $this->success([
            'has_superadmin' => User::where('role', 'superadmin')->exists(),
        ]);
    }

    public function bootstrap(Request $request): JsonResponse
    {
        if (User::where('role', 'superadmin')->exists()) {
            return $this->error('A superadmin account already exists.', [], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $superadmin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'superadmin',
            'email_verified_at' => now(),
        ]);

        $token = $superadmin->createToken('auth-token', ['*'], now()->addDays(30))->plainTextToken;

        return $this->success([
            'user' => $superadmin,
            'token' => $token,
        ], 'Superadmin account created.', 201);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        return $this->success($admin, 'Admin account created.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$id,
            'password' => 'sometimes|string|min:8|confirmed',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $admin->update($validated);

        return $this->success($admin->fresh(), 'Admin account updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $admin = User::where('role', 'admin')->findOrFail($id);
        $admin->delete();

        return $this->success(null, 'Admin account deleted.');
    }
}
