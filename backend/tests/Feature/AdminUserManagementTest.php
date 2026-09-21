<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_a_users_contact_details_without_changing_their_role(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->deliveryPartner()->create([
            'name' => 'Original Name',
            'email' => 'original@example.test',
            'phone' => '9000000000',
        ]);

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$user->id}", [
                'name' => 'Updated Name',
                'email' => 'updated@example.test',
                'phone' => '9111111111',
                'role' => 'admin',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.email', 'updated@example.test')
            ->assertJsonPath('data.role', 'delivery_partner');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.test',
            'phone' => '9111111111',
            'role' => 'delivery_partner',
        ]);
    }

    public function test_deactivation_preserves_the_user_record(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->customer()->create(['is_active' => true]);

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$user->id}/deactivate")
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'is_active' => false]);
    }

    public function test_admin_can_edit_platform_coupon_details(): void
    {
        $admin = User::factory()->admin()->create();
        $coupon = Coupon::create([
            'code' => 'WELCOME10',
            'title' => 'Welcome offer',
            'type' => 'percentage',
            'value' => 10,
            'min_order_amount' => 100,
            'per_user_limit' => 1,
            'valid_from' => now(),
            'valid_until' => now()->addWeek(),
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->putJson("/api/admin/coupons/{$coupon->id}", [
                'code' => 'WELCOME15',
                'title' => 'Updated welcome offer',
                'description' => 'New customer promotion',
                'type' => 'percentage',
                'value' => 15,
                'min_order_amount' => 150,
                'max_discount' => 75,
                'usage_limit' => 100,
                'per_user_limit' => 1,
                'valid_from' => now()->toDateString(),
                'valid_until' => now()->addWeek()->toDateString(),
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.code', 'WELCOME15')
            ->assertJsonPath('data.description', 'New customer promotion')
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('coupons', [
            'id' => $coupon->id,
            'code' => 'WELCOME15',
            'restaurant_id' => null,
            'is_active' => false,
        ]);
    }
}
