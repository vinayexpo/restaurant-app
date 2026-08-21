<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('status', [
                'pending', 'confirmed', 'preparing', 'ready_for_pickup',
                'picked_up', 'on_the_way', 'delivered', 'cancelled',
            ]);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete()
                ->comment('user_id who triggered the change');
            $table->string('note')->nullable()->comment('e.g. reject reason, cancel reason');
            $table->timestamp('created_at')->useCurrent();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
    }
};
