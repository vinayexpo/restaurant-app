<?php

namespace App\Jobs;

use App\Mail\OrderConfirmed;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 60;

    public array $backoff = [30, 60, 120];

    public function __construct(public Order $order)
    {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        Mail::to($this->order->user->email)->send(new OrderConfirmed($this->order));
    }
}
