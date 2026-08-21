<?php

use App\Http\Controllers\Admin\AdminDeliveryController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\CouponManageController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LoyaltyManageController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\RestaurantApprovalController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserManageController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CouponController;
use App\Http\Controllers\Customer\DeliveryRatingController;
use App\Http\Controllers\Customer\FavouriteController;
use App\Http\Controllers\Customer\LoyaltyController;
use App\Http\Controllers\Customer\MenuController;
use App\Http\Controllers\Customer\NotificationController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\PushSubscriptionController;
use App\Http\Controllers\Customer\ReviewController;
use App\Http\Controllers\Customer\RestaurantController;
use App\Http\Controllers\Delivery\DeliveryController;
use App\Http\Controllers\Delivery\DeliveryOrderController;
use App\Http\Controllers\Owner\CategoryController as OwnerCategoryController;
use App\Http\Controllers\Owner\MenuItemController as OwnerMenuItemController;
use App\Http\Controllers\Owner\OrderManageController;
use App\Http\Controllers\Owner\OwnerCouponController;
use App\Http\Controllers\Owner\RestaurantManageController;
use App\Http\Controllers\Owner\RevenueController;
use App\Http\Controllers\Owner\ReviewManageController;
use App\Http\Controllers\Payment\PaymentController;
use App\Http\Controllers\PublicSettingsController;
use App\Http\Controllers\Superadmin\AuditLogController;
use App\Http\Controllers\Superadmin\CommissionController;
use App\Http\Controllers\Superadmin\FeatureFlagController;
use App\Http\Controllers\Superadmin\FinancialsController;
use App\Http\Controllers\Superadmin\ImpersonationController;
use App\Http\Controllers\Superadmin\PlatformSettingsController;
use App\Http\Controllers\Superadmin\SuperAdminController;
use Illuminate\Support\Facades\Route;

// ─── PUBLIC ───────────────────────────────────────────────────────────────
Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

Route::middleware('throttle:forgot-password')->group(function () {
    Route::post('/auth/forgot-password', [PasswordResetController::class, 'send']);
    Route::post('/auth/reset-password', [PasswordResetController::class, 'reset']);
});

Route::get('/auth/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed'])->name('verification.verify');

Route::get('/settings/public', [PublicSettingsController::class, 'index']);

Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/featured', [RestaurantController::class, 'featured']);
Route::get('/restaurants/search', [RestaurantController::class, 'search']);
Route::get('/restaurants/autocomplete', [RestaurantController::class, 'autocomplete']);
Route::get('/restaurants/{slug}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{id}/menu', [MenuController::class, 'byRestaurant']);
Route::get('/restaurants/{id}/reviews', [ReviewController::class, 'index']);

Route::post('/webhooks/razorpay', [PaymentController::class, 'razorpayWebhook']);

// ─── AUTHENTICATED (Sanctum) ────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);
    Route::post('/auth/email/resend', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:3,1');

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::post('/push-subscriptions', [PushSubscriptionController::class, 'store']);
    Route::delete('/push-subscriptions', [PushSubscriptionController::class, 'destroy']);

    // ─── CUSTOMER ───────────────────────────────────────────────────────────
    Route::middleware('role:customer')->group(function () {
        Route::apiResource('addresses', AddressController::class);
        Route::patch('/addresses/{id}/set-default', [AddressController::class, 'setDefault']);

        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart/items', [CartController::class, 'storeItem']);
        Route::put('/cart/items/{id}', [CartController::class, 'updateItem']);
        Route::delete('/cart/items/{id}', [CartController::class, 'destroyItem']);
        Route::delete('/cart', [CartController::class, 'clear']);

        Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

        Route::post('/payment/initiate', [PaymentController::class, 'initiate'])
            ->middleware('throttle:payment');
        Route::post('/payment/verify', [PaymentController::class, 'verify'])
            ->middleware(['throttle:payment', 'verified']);

        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::patch('/orders/{id}/cancel', [OrderController::class, 'cancel']);
        Route::post('/orders/{id}/reorder', [OrderController::class, 'reorder']);
        Route::post('/orders/{id}/rate-delivery', [DeliveryRatingController::class, 'store']);

        Route::get('/favourites', [FavouriteController::class, 'index']);
        Route::post('/favourites/{restaurantId}', [FavouriteController::class, 'store']);
        Route::delete('/favourites/{restaurantId}', [FavouriteController::class, 'destroy']);

        Route::post('/reviews', [ReviewController::class, 'store']);

        Route::get('/loyalty', [LoyaltyController::class, 'summary']);
        Route::get('/loyalty/transactions', [LoyaltyController::class, 'transactions']);
        Route::post('/loyalty/redeem', [LoyaltyController::class, 'redeem']);
        Route::get('/loyalty/tiers', [LoyaltyController::class, 'tiers']);
    });

    // ─── RESTAURANT OWNER ───────────────────────────────────────────────────
    Route::prefix('owner')->group(function () {
        Route::post('/restaurant', [RestaurantManageController::class, 'store']);

        Route::middleware(['role:restaurant_owner', 'check.restaurant.owner'])->group(function () {
            Route::get('/restaurant', [RestaurantManageController::class, 'show']);
            Route::put('/restaurant', [RestaurantManageController::class, 'update']);
            Route::get('/restaurant/hours', [RestaurantManageController::class, 'hours']);
            Route::put('/restaurant/hours', [RestaurantManageController::class, 'updateHours']);

            Route::apiResource('categories', OwnerCategoryController::class);

            Route::apiResource('menu-items', OwnerMenuItemController::class);
            Route::post('/menu-items/{id}/variants', [OwnerMenuItemController::class, 'addVariant']);
            Route::put('/menu-items/{id}/variants/{variantId}', [OwnerMenuItemController::class, 'updateVariant']);
            Route::delete('/menu-items/{id}/variants/{variantId}', [OwnerMenuItemController::class, 'deleteVariant']);

            Route::get('/orders', [OrderManageController::class, 'index']);
            Route::get('/orders/{id}', [OrderManageController::class, 'show']);
            Route::patch('/orders/{id}/status', [OrderManageController::class, 'updateStatus']);

            Route::get('/reviews', [ReviewManageController::class, 'index']);
            Route::patch('/reviews/{id}/reply', [ReviewManageController::class, 'reply']);

            Route::apiResource('coupons', OwnerCouponController::class);

            Route::get('/revenue', [RevenueController::class, 'index']);
        });
    });

    // ─── DELIVERY PARTNER ───────────────────────────────────────────────────
    Route::middleware('role:delivery_partner')->prefix('delivery')->group(function () {
        Route::get('/profile', [DeliveryController::class, 'profile']);
        Route::put('/profile', [DeliveryController::class, 'updateProfile']);
        Route::patch('/availability', [DeliveryController::class, 'toggleAvailability']);
        Route::patch('/location', [DeliveryController::class, 'updateLocation']);

        Route::get('/orders/available', [DeliveryOrderController::class, 'available']);
        Route::post('/orders/{id}/accept', [DeliveryOrderController::class, 'accept']);
        Route::patch('/orders/{id}/status', [DeliveryOrderController::class, 'updateStatus']);
        Route::get('/orders/{id}', [DeliveryOrderController::class, 'show']);

        Route::get('/history', [DeliveryOrderController::class, 'history']);
        Route::get('/earnings', [DeliveryOrderController::class, 'earnings']);
        Route::get('/earnings/summary', [DeliveryOrderController::class, 'earningsSummary']);
    });

    // ─── ADMIN (admin + superadmin both access these) ──────────────────────
    Route::middleware('role:admin,superadmin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'stats']);

        Route::get('/users', [UserManageController::class, 'index']);
        Route::get('/users/{id}', [UserManageController::class, 'show']);
        Route::patch('/users/{id}/activate', [UserManageController::class, 'activate']);
        Route::patch('/users/{id}/deactivate', [UserManageController::class, 'deactivate']);
        Route::delete('/users/{id}', [UserManageController::class, 'destroy']);

        Route::get('/restaurants', [RestaurantApprovalController::class, 'index']);
        Route::get('/restaurants/{id}', [RestaurantApprovalController::class, 'show']);
        Route::patch('/restaurants/{id}/approve', [RestaurantApprovalController::class, 'approve']);
        Route::patch('/restaurants/{id}/reject', [RestaurantApprovalController::class, 'reject']);
        Route::patch('/restaurants/{id}/suspend', [RestaurantApprovalController::class, 'suspend']);
        Route::patch('/restaurants/{id}/feature', [RestaurantApprovalController::class, 'toggleFeatured']);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);

        Route::get('/delivery-partners', [AdminDeliveryController::class, 'index']);
        Route::patch('/delivery-partners/{id}/verify', [AdminDeliveryController::class, 'verify']);
        Route::patch('/delivery-partners/{id}/suspend', [AdminDeliveryController::class, 'suspend']);

        Route::get('/coupons', [CouponManageController::class, 'index']);
        Route::post('/coupons', [CouponManageController::class, 'store']);
        Route::put('/coupons/{id}', [CouponManageController::class, 'update']);
        Route::delete('/coupons/{id}', [CouponManageController::class, 'destroy']);

        Route::get('/loyalty/config', [LoyaltyManageController::class, 'config']);
        Route::put('/loyalty/config', [LoyaltyManageController::class, 'updateConfig']);
        Route::get('/loyalty/tiers', [LoyaltyManageController::class, 'tiers']);
        Route::put('/loyalty/tiers/{id}', [LoyaltyManageController::class, 'updateTier']);
        Route::post('/loyalty/bonus', [LoyaltyManageController::class, 'bonus']);

        Route::post('/notifications/broadcast', [AdminNotificationController::class, 'broadcast']);

        Route::get('/settings', [SettingsController::class, 'index']);
        Route::put('/settings/{key}', [SettingsController::class, 'update']);

        Route::get('/reports/revenue', [ReportController::class, 'revenue']);
        Route::get('/reports/orders', [ReportController::class, 'orders']);
    });

    // Impersonation stop must be reachable by the impersonated user's token,
    // whose underlying role is not superadmin — kept outside the role gate.
    Route::delete('/superadmin/impersonate', [ImpersonationController::class, 'stop']);

    // ─── SUPERADMIN ─────────────────────────────────────────────────────────
    Route::middleware('role:superadmin')->prefix('superadmin')->group(function () {
        Route::get('/admins', [SuperAdminController::class, 'index']);
        Route::post('/admins', [SuperAdminController::class, 'store']);
        Route::put('/admins/{id}', [SuperAdminController::class, 'update']);
        Route::delete('/admins/{id}', [SuperAdminController::class, 'destroy']);

        Route::get('/commissions', [CommissionController::class, 'index']);
        Route::post('/commissions', [CommissionController::class, 'store']);
        Route::put('/commissions/{id}', [CommissionController::class, 'update']);
        Route::delete('/commissions/{id}', [CommissionController::class, 'destroy']);

        Route::get('/audit-logs', [AuditLogController::class, 'index']);

        Route::post('/impersonate/{userId}', [ImpersonationController::class, 'start']);

        Route::get('/financials', [FinancialsController::class, 'index']);

        Route::get('/feature-flags', [FeatureFlagController::class, 'index']);
        Route::put('/feature-flags/{key}', [FeatureFlagController::class, 'update']);

        Route::get('/settings', [PlatformSettingsController::class, 'index']);
        Route::put('/settings/{key}', [PlatformSettingsController::class, 'update']);
    });
});
