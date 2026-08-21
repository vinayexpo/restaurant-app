<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->decimal('price', 8, 2);
            $table->decimal('discounted_price', 8, 2)->nullable();
            $table->string('image', 500)->nullable();
            $table->boolean('is_veg')->default(true);
            $table->boolean('is_available')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedTinyInteger('preparation_time')->default(15);
            $table->unsignedSmallInteger('calories')->nullable();
            $table->json('tags')->nullable()->comment('e.g. ["bestseller","spicy","new"]');
            $table->timestamps();
            $table->softDeletes()->comment('Soft delete — removed items still show in past orders');

            $table->fullText('name');
            $table->index(['restaurant_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
