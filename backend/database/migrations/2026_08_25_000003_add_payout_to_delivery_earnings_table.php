<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('delivery_earnings', 'delivery_payout_id')) {
            Schema::table('delivery_earnings', function (Blueprint $table) {
                $table->foreignId('delivery_payout_id')->nullable()->after('order_id')
                    ->constrained('delivery_payouts')->nullOnDelete();
            });
        }

        if (! Schema::hasIndex('delivery_earnings', 'delivery_earnings_payout_lookup')) {
            Schema::table('delivery_earnings', function (Blueprint $table) {
                $table->index(['delivery_partner_id', 'status', 'delivery_payout_id'], 'delivery_earnings_payout_lookup');
            });
        }
    }

    public function down(): void
    {
        Schema::table('delivery_earnings', function (Blueprint $table) {
            $table->dropIndex('delivery_earnings_payout_lookup');
            $table->dropConstrainedForeignId('delivery_payout_id');
        });
    }
};
