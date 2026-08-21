<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('rate_pct', 5, 2)->default(10.00)
                ->comment('Platform cut % of order subtotal; set by superadmin');
            $table->date('effective_from');
            $table->text('notes')->nullable()->comment('Reason for custom rate if different from platform default');
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete()
                ->comment('superadmin user id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_commissions');
    }
};
