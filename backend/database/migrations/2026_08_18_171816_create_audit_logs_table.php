<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete()
                ->comment('Who performed the action (admin or superadmin)');
            $table->enum('user_role', ['admin', 'superadmin']);
            $table->string('action', 100)->comment('e.g. restaurant.approve, user.deactivate, coupon.delete');
            $table->string('target_type', 100)->nullable()->comment('Model class e.g. App\\Models\\Restaurant');
            $table->unsignedBigInteger('target_id')->nullable()->comment('ID of the affected record');
            $table->json('old_values')->nullable()->comment('State before change');
            $table->json('new_values')->nullable()->comment('State after change');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('action');
            $table->index(['target_type', 'target_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
