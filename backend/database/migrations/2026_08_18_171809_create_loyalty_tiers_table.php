<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_tiers', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('name', 50)->comment('Bronze|Silver|Gold|Platinum');
            $table->unsignedInteger('min_lifetime_points');
            $table->decimal('points_multiplier', 3, 2)->default(1.00)->comment('1x, 1.25x, 1.5x, 2x');
            $table->boolean('free_delivery')->default(false);
            $table->decimal('free_delivery_min', 8, 2)->nullable()
                ->comment('NULL = always free; value = min order for free delivery');
            $table->string('badge_color', 7)->comment('hex color e.g. #CD7F32');
            $table->json('perks')->nullable()->comment('Array of perk description strings');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_tiers');
    }
};
