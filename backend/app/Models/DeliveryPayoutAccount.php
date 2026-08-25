<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryPayoutAccount extends Model
{
    protected $fillable = [
        'delivery_partner_id', 'type', 'account_holder_name', 'account_number', 'ifsc_code', 'upi_id', 'is_active',
    ];

    protected $hidden = ['account_number', 'ifsc_code', 'upi_id'];

    protected function casts(): array
    {
        return [
            'account_number' => 'encrypted',
            'ifsc_code' => 'encrypted',
            'upi_id' => 'encrypted',
            'is_active' => 'boolean',
        ];
    }

    public function deliveryPartner(): BelongsTo
    {
        return $this->belongsTo(DeliveryPartner::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(DeliveryPayout::class);
    }

    public function summary(): string
    {
        if ($this->type === 'upi') {
            return substr((string) $this->upi_id, 0, 3).'***';
        }

        return 'Bank account ending '.substr((string) $this->account_number, -4);
    }
}
