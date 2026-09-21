<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeEmail;
use App\Models\DeliveryPartner;
use App\Models\User;
use App\Services\ImageService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private ImageService $imageService) {}

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:15',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['nullable', Rule::in(['customer', 'delivery_partner'])],
            'vehicle_type' => 'required_if:role,delivery_partner|in:bicycle,motorcycle,scooter',
            'vehicle_number' => 'required_if:role,delivery_partner|string|max:20',
            'licence_number' => 'required_if:role,delivery_partner|string|max:30',
        ]);

        $role = $validated['role'] ?? 'customer';

        $user = DB::transaction(function () use ($validated, $role) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'role' => $role,
            ]);

            if ($role === 'delivery_partner') {
                DeliveryPartner::create([
                    'user_id' => $user->id,
                    'vehicle_type' => $validated['vehicle_type'],
                    'vehicle_number' => $validated['vehicle_number'],
                    'licence_number' => $validated['licence_number'],
                    'is_verified' => false,
                    'is_available' => false,
                ]);
            }

            return $user;
        });

        $token = $user->createToken('auth-token', ['*'], now()->addDays(30))->plainTextToken;

        Mail::to($user->email)->queue(new WelcomeEmail($user));

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Registered successfully.', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt($validated)) {
            return $this->error('Invalid credentials.', [], 401);
        }

        $user = User::where('email', $validated['email'])->firstOrFail();

        if (! $user->is_active) {
            return $this->error('Your account has been deactivated.', [], 403);
        }

        $token = $user->createToken('auth-token', ['*'], now()->addDays(30))->plainTextToken;

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Logged in successfully.');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isRestaurantOwner()) {
            $user->load('restaurant');
        } elseif ($user->isDeliveryPartner()) {
            $user->load('deliveryPartner');
        }

        return $this->success($user);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:15',
            'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($request->hasFile('profile_image')) {
            $validated['profile_image'] = $this->imageService->storeWebP($request->file('profile_image'), 'profiles');
        }

        $user->update($validated);

        return $this->success($user, 'Profile updated successfully.');
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($validated['current_password'], $request->user()->password)) {
            return $this->error('Current password is incorrect.', [], 422);
        }

        $request->user()->update(['password' => Hash::make($validated['new_password'])]);

        $request->user()->tokens()
            ->where('id', '!=', $request->user()->currentAccessToken()->id)
            ->delete();

        return $this->success(null, 'Password changed successfully.');
    }

    public function destroyAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'confirmation' => 'required|string|in:DELETE',
        ]);

        $user = $request->user();

        if (! $user->isCustomer()) {
            return $this->error('Only customer accounts can be deleted here.', [], 403);
        }

        if (! Hash::check($validated['current_password'], $user->password)) {
            return $this->error('Current password is incorrect.', ['current_password' => ['Current password is incorrect.']], 422);
        }

        DB::transaction(function () use ($user) {
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            $anonymousEmail = "deleted-customer-{$user->id}-".Str::lower(Str::random(16)).'@deleted.invalid';

            // Retain the user row for immutable order and payment records without personal data.
            $user->tokens()->delete();
            DB::table('push_subscriptions')->where('user_id', $user->id)->delete();
            DB::table('favourites')->where('user_id', $user->id)->delete();
            DB::table('cart_items')->whereIn('cart_id', DB::table('carts')->where('user_id', $user->id)->select('id'))->delete();
            DB::table('carts')->where('user_id', $user->id)->delete();

            $user->forceFill([
                'name' => "Deleted customer #{$user->id}",
                'email' => $anonymousEmail,
                'phone' => null,
                'profile_image' => null,
                'password' => Hash::make(Str::random(64)),
                'remember_token' => null,
                'email_verified_at' => null,
                'is_active' => false,
            ])->save();
        });

        return $this->success(null, 'Your account has been deleted.');
    }
}
