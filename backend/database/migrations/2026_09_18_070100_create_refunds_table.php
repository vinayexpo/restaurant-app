<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('idempotency_key', 100);
            $table->string('razorpay_payment_id')->nullable();
            $table->string('razorpay_refund_id')->nullable()->unique();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['requested', 'processed', 'failed'])->default('requested');
            $table->string('reason', 255)->nullable();
            $table->json('provider_payload')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('benefits_restored_at')->nullable();
            $table->timestamps();
            $table->unique(['order_id', 'idempotency_key']);
            $table->index(['razorpay_payment_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
