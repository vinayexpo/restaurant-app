<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        $statusLabel = ucwords(str_replace('_', ' ', $this->order->status));

        return new Envelope(
            subject: "Order {$this->order->order_number} — {$statusLabel}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order-status-updated',
            with: ['order' => $this->order],
        );
    }
}
