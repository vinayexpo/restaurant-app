<?php

$frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
$frontendHost = parse_url($frontendUrl, PHP_URL_HOST);

$allowedOrigins = array_values(array_filter([
    $frontendUrl,
    'http://localhost:7358',
    'http://127.0.0.1:7358',
]));

$allowedOriginPatterns = array_values(array_filter([
    $frontendHost ? sprintf('#^https?://%s(?::\d+)?$#', preg_quote($frontendHost, '#')) : null,
    '#^https?://localhost(?::\d+)?$#',
    '#^https?://127\.0\.0\.1(?::\d+)?$#',
]));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => $allowedOriginPatterns,

    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
