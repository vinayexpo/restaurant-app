<?php

use App\Console\Commands\ExpireLoyaltyPoints;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(ExpireLoyaltyPoints::class)->dailyAt('00:05');
