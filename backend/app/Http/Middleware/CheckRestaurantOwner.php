<?php

namespace App\Http\Middleware;

use App\Models\Restaurant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRestaurantOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        $restaurant = Restaurant::where('user_id', $request->user()->id)->firstOrFail();

        $request->merge(['restaurant' => $restaurant]);
        app()->instance('currentRestaurant', $restaurant);

        return $next($request);
    }
}
