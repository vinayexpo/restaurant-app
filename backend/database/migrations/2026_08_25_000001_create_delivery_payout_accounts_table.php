<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_payout_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_partner_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['bank_account', 'upi']);
            $table->string('account_holder_name')->nullable();
            $table->text('account_number')->nullable();
            $table->text('ifsc_code')->nullable();
            $table->text('upi_id')->nullable();
            $table->string('provider_fund_account_id')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_payout_accounts');
    }
};
