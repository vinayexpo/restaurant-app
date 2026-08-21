<?php

namespace App\Mail;

use App\Models\Restaurant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RestaurantApproved extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Restaurant $restaurant) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your restaurant \"{$this->restaurant->name}\" has been approved!",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.restaurant-approved',
            with: ['restaurant' => $this->restaurant],
        );
    }
}
