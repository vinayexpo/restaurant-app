<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditObserver
{
    public function created(Model $model): void
    {
        $this->log($model, class_basename($model).'.created', null, $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $this->log($model, class_basename($model).'.updated', $model->getOriginal(), $model->getChanges());
    }

    public function deleted(Model $model): void
    {
        $this->log($model, class_basename($model).'.deleted', $model->getAttributes(), null);
    }

    private function log(Model $model, string $action, ?array $old, ?array $new): void
    {
        $user = Auth::user();

        if (! $user || ! in_array($user->role, ['admin', 'superadmin'], true)) {
            return;
        }

        AuditLog::create([
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => strtolower($action),
            'target_type' => get_class($model),
            'target_id' => is_numeric($model->getKey()) ? $model->getKey() : null,
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
