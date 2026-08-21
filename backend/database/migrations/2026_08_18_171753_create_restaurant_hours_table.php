<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week')->comment('0=Sunday, 1=Monday, ..., 6=Saturday');
            $table->time('opening_time');
            $table->time('closing_time');
            $table->boolean('is_closed')->default(false)->comment('True = closed all day (e.g. public holiday)');

            $table->unique(['restaurant_id', 'day_of_week'], 'unique_day');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_hours');
    }
};
