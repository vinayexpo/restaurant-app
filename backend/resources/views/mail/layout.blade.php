<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ config('app.name') }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden;">
        <tr>
          <td style="background-color:#F97316; padding:24px 32px;">
            <span style="font-size:20px; font-weight:700; color:#ffffff;">{{ config('app.name') }}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            @yield('content')
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px; background-color:#fafafa; border-top:1px solid #e5e4e7;">
            <span style="font-size:12px; color:#6b6375;">&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
