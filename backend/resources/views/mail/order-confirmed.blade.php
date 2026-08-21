@extends('mail.layout')

@section('content')
    <h1 style="font-size:22px; color:#08060d; margin:0 0 8px;">Order Confirmed!</h1>
    <p style="font-size:14px; color:#6b6375; margin:0 0 20px;">
        Order <strong>{{ $order->order_number }}</strong> from <strong>{{ $order->restaurant->name }}</strong> has been placed.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        @foreach ($order->items as $item)
            <tr>
                <td style="padding:6px 0; font-size:14px; color:#08060d;">
                    {{ $item->quantity }}&times; {{ $item->menu_item_name }}
                    @if ($item->variant_name)
                        <span style="color:#6b6375;">({{ $item->variant_name }})</span>
                    @endif
                </td>
                <td style="padding:6px 0; font-size:14px; color:#08060d; text-align:right;">
                    &#8377;{{ number_format($item->total_price, 2) }}
                </td>
            </tr>
        @endforeach
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e4e7; padding-top:12px;">
        <tr>
            <td style="padding:4px 0; font-size:13px; color:#6b6375;">Subtotal</td>
            <td style="padding:4px 0; font-size:13px; color:#08060d; text-align:right;">&#8377;{{ number_format($order->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td style="padding:4px 0; font-size:13px; color:#6b6375;">Delivery Fee</td>
            <td style="padding:4px 0; font-size:13px; color:#08060d; text-align:right;">&#8377;{{ number_format($order->delivery_fee, 2) }}</td>
        </tr>
        <tr>
            <td style="padding:4px 0; font-size:13px; color:#6b6375;">Tax</td>
            <td style="padding:4px 0; font-size:13px; color:#08060d; text-align:right;">&#8377;{{ number_format($order->tax_amount, 2) }}</td>
        </tr>
        <tr>
            <td style="padding:8px 0 0; font-size:16px; font-weight:700; color:#08060d;">Total</td>
            <td style="padding:8px 0 0; font-size:16px; font-weight:700; color:#08060d; text-align:right;">&#8377;{{ number_format($order->total_amount, 2) }}</td>
        </tr>
    </table>
@endsection
