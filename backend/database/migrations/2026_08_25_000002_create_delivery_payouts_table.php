<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_partner_id')->constrained()->restrictOnDelete();
            $table->foreignId('delivery_payout_account_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['requested', 'processing', 'paid', 'failed', 'rejected'])->default('requested');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('provider_payout_id')->nullable()->unique();
            $table->string('provider_status')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_payouts');
    }
};
