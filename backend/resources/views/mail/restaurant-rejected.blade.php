@extends('mail.layout')

@section('content')
    <h1 style="font-size:22px; color:#08060d; margin:0 0 16px;">Application Update</h1>
    <p style="font-size:15px; color:#6b6375; line-height:1.6; margin:0 0 8px;">
        We're unable to approve <strong>{{ $restaurant->name }}</strong> at this time.
    </p>
    @if ($restaurant->rejection_reason)
        <p style="font-size:14px; color:#08060d; background-color:#fafafa; border-radius:8px; padding:12px 16px; margin:0 0 16px;">
            {{ $restaurant->rejection_reason }}
        </p>
    @endif
    <p style="font-size:14px; color:#6b6375; line-height:1.6; margin:0;">
        You're welcome to update your details and reapply.
    </p>
@endsection
