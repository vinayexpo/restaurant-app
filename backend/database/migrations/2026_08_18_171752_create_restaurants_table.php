<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('address', 500);
            $table->string('city', 100);
            $table->string('state', 100);
            $table->string('pincode', 10);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('phone', 15);
            $table->string('email');
            $table->string('logo', 500)->nullable();
            $table->string('cover_image', 500)->nullable();
            $table->json('cuisine_types')->comment('e.g. ["Indian","Chinese","Pizza"]');
            $table->time('opening_time');
            $table->time('closing_time');
            $table->boolean('is_open')->default(true);
            $table->decimal('min_order_amount', 8, 2)->default(0);
            $table->decimal('delivery_fee', 8, 2)->default(0);
            $table->unsignedTinyInteger('avg_delivery_time')->default(30);
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->boolean('is_active')->default(false)->comment('Admin must approve');
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_featured')->default(false)->comment('Admin sets — shown on home page');
            $table->string('rejection_reason', 500)->nullable()->comment('Set when admin rejects application');
            $table->string('fssai_number', 50);
            $table->string('gst_number', 20)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('city');
            $table->index('slug');
            $table->fullText('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
