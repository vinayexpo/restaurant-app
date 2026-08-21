@extends('mail.layout')

@section('content')
    <h1 style="font-size:22px; color:#08060d; margin:0 0 16px;">Welcome, {{ $user->name }}!</h1>
    <p style="font-size:15px; color:#6b6375; line-height:1.6; margin:0 0 16px;">
        Thanks for joining {{ config('app.name') }}. Browse restaurants near you and get your favourite food delivered fast.
    </p>
    <a href="{{ env('FRONTEND_URL') }}"
       style="display:inline-block; background-color:#F97316; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; font-size:14px;">
        Start Ordering
    </a>
@endsection
