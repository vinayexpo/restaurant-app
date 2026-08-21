<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    use ApiResponse;

    private const SUPERADMIN_ONLY_KEYS = ['tax_rate_pct', 'maintenance_mode', 'default_commission_pct'];

    public function index(): JsonResponse
    {
        $settings = PlatformSetting::whereNotIn('key', self::SUPERADMIN_ONLY_KEYS)->get();

        return $this->success($settings);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        if (in_array($key, self::SUPERADMIN_ONLY_KEYS, true)) {
            return $this->error('This setting can only be changed by a superadmin.', [], 403);
        }

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
