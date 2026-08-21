<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformCommission extends Model
{
    protected $fillable = ['restaurant_id', 'rate_pct', 'effective_from', 'notes', 'created_by'];

    protected function casts(): array
    {
        return [
            'rate_pct' => 'decimal:2',
            'effective_from' => 'date',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
