<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('balance')->default(0)->comment('Redeemable points currently held');
            $table->unsignedInteger('lifetime_earned')->default(0)
                ->comment('Total ever earned — used for tier calculation');
            $table->unsignedTinyInteger('tier_id')->default(1);
            $table->timestamp('tier_updated_at')->nullable();
            $table->boolean('tier_manually_set')->default(false)
                ->comment('When TRUE auto-recalculation skips this user');
            $table->timestamps();

            $table->foreign('tier_id')->references('id')->on('loyalty_tiers')->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_points');
    }
};
