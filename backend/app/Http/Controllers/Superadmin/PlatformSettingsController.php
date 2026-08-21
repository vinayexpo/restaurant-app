<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlatformSettingsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success(PlatformSetting::orderBy('key')->get());
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $setting = PlatformSetting::findOrFail($key);

        $validated = $request->validate([
            'value' => 'required',
            'cast' => ['sometimes', Rule::in(['string', 'integer', 'float', 'boolean', 'json'])],
        ]);

        $cast = $validated['cast'] ?? $setting->cast;
        $value = $cast === 'json' ? json_encode($validated['value']) : (string) $validated['value'];

        $setting->update(['value' => $value, 'cast' => $cast]);

        return $this->success($setting->fresh(), 'Setting updated successfully.');
    }
}
