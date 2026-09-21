<?php

namespace Tests\Feature;

use App\Models\PlatformCommission;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperadminAccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_edit_and_deactivate_an_admin_account(): void
    {
        $superadmin = User::factory()->superadmin()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($superadmin)
            ->putJson("/api/superadmin/admins/{$admin->id}", [
                'name' => 'Updated Admin',
                'email' => 'updated-admin@example.test',
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Admin')
            ->assertJsonPath('data.email', 'updated-admin@example.test')
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'name' => 'Updated Admin',
            'email' => 'updated-admin@example.test',
            'is_active' => false,
        ]);
    }

    public function test_superadmin_can_edit_a_commission_override_without_reassigning_restaurant(): void
    {
        $superadmin = User::factory()->superadmin()->create();
        $restaurant = Restaurant::factory()->create();
        $commission = PlatformCommission::create([
            'restaurant_id' => $restaurant->id,
            'rate_pct' => 10,
            'effective_from' => '2026-09-01',
            'notes' => 'Initial rate',
            'created_by' => $superadmin->id,
        ]);

        $this->actingAs($superadmin)
            ->putJson("/api/superadmin/commissions/{$commission->id}", [
                'rate_pct' => 12.5,
                'effective_from' => '2026-10-01',
                'notes' => 'Seasonal adjustment',
            ])
            ->assertOk()
            ->assertJsonPath('data.restaurant_id', $restaurant->id)
            ->assertJsonPath('data.rate_pct', '12.50')
            ->assertJsonPath('data.notes', 'Seasonal adjustment');

        $this->assertDatabaseHas('platform_commissions', [
            'id' => $commission->id,
            'restaurant_id' => $restaurant->id,
            'rate_pct' => 12.5,
            'notes' => 'Seasonal adjustment',
        ]);
    }
}
