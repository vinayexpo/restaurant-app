export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        {Icon ? <Icon size={28} strokeWidth={1.75} /> : null}
      </div>
      <h3 className="font-display text-lg font-bold text-neutral-900">{title}</h3>
      {description && <p className="max-w-xs text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
