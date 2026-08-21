<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 25)->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('restaurant_id')->constrained()->restrictOnDelete();
            $table->foreignId('delivery_partner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('delivery_address_id')->constrained('addresses')->restrictOnDelete();
            $table->enum('status', [
                'pending', 'confirmed', 'preparing', 'ready_for_pickup',
                'picked_up', 'on_the_way', 'delivered', 'cancelled',
            ])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->enum('payment_method', ['cod', 'razorpay']);
            $table->string('razorpay_order_id')->nullable()->comment('Razorpay order ID created before checkout');
            $table->string('razorpay_payment_id')->nullable()->comment('Razorpay payment ID returned after success');
            $table->string('razorpay_signature', 512)->nullable()->comment('HMAC signature verified server-side');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_fee', 8, 2);
            $table->decimal('discount_amount', 8, 2)->default(0);
            $table->decimal('tax_amount', 8, 2);
            $table->decimal('total_amount', 10, 2);
            $table->string('coupon_code', 50)->nullable();
            $table->unsignedInteger('loyalty_points_redeemed')->default(0);
            $table->decimal('loyalty_discount_amount', 8, 2)->default(0);
            $table->text('special_instructions')->nullable();
            $table->timestamp('estimated_delivery_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancel_reason')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('restaurant_id');
            $table->index('status');
            $table->index('delivery_partner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
