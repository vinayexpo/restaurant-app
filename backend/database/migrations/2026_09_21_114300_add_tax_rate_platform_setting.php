<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('platform_settings')->updateOrInsert(
            ['key' => 'tax_rate_pct'],
            ['value' => '5', 'cast' => 'float', 'updated_at' => now()]
        );
    }

    public function down(): void
    {
        DB::table('platform_settings')
            ->where('key', 'tax_rate_pct')
            ->delete();
    }
};
