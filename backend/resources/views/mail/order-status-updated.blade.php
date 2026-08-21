@extends('mail.layout')

@section('content')
    <h1 style="font-size:22px; color:#08060d; margin:0 0 8px;">Order Update</h1>
    <p style="font-size:15px; color:#6b6375; line-height:1.6; margin:0;">
        Your order <strong>{{ $order->order_number }}</strong> status is now:
    </p>
    <p style="display:inline-block; margin:12px 0 0; padding:8px 16px; background-color:#F97316; color:#ffffff; border-radius:999px; font-size:14px; font-weight:600; text-transform:capitalize;">
        {{ str_replace('_', ' ', $order->status) }}
    </p>
@endsection
