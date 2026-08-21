<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete()
                ->comment('NULL for manual/bonus transactions');
            $table->enum('type', ['earned', 'redeemed', 'expired', 'bonus', 'adjusted']);
            $table->integer('points')->comment('Positive = credit, negative = debit');
            $table->unsignedInteger('balance_after')->comment('Snapshot of balance after this transaction');
            $table->string('description')->comment('Human-readable e.g. "Earned on order #ORD-001"');
            $table->timestamp('expires_at')->nullable()->comment('For earned points — 12 months from credit date');
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('type');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
    }
};
