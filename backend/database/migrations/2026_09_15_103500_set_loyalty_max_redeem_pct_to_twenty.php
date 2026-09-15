<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('platform_settings')->updateOrInsert(
            ['key' => 'loyalty_max_redeem_pct'],
            ['value' => '20', 'cast' => 'integer', 'updated_at' => now()]
        );
    }

    public function down(): void
    {
        DB::table('platform_settings')
            ->where('key', 'loyalty_max_redeem_pct')
            ->update(['value' => '1', 'cast' => 'integer', 'updated_at' => now()]);
    }
};
