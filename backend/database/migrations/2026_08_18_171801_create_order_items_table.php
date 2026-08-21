<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained()->restrictOnDelete();
            $table->string('menu_item_name')->comment('Snapshot — item may be deleted later');
            $table->string('variant_name', 100)->nullable()->comment('Snapshot');
            $table->unsignedTinyInteger('quantity');
            $table->decimal('unit_price', 8, 2);
            $table->decimal('total_price', 8, 2);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
