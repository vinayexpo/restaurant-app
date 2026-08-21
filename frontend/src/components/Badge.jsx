const STATUS_STYLES = {
  pending: 'bg-warning-500/15 text-warning-500',
  confirmed: 'bg-brand-500/15 text-brand-600',
  preparing: 'bg-brand-500/15 text-brand-600',
  ready_for_pickup: 'bg-accent-500/15 text-accent-600',
  picked_up: 'bg-accent-500/15 text-accent-600',
  on_the_way: 'bg-accent-500/15 text-accent-600',
  delivered: 'bg-accent-500/20 text-accent-600',
  cancelled: 'bg-danger-500/15 text-danger-600',
  paid: 'bg-accent-500/15 text-accent-600',
  refunded: 'bg-neutral-200 text-neutral-600',
  failed: 'bg-danger-500/15 text-danger-600',
}

const NEUTRAL_STYLE = 'bg-neutral-100 text-neutral-600'

export function Badge({ status, children, className = '' }) {
  const style = STATUS_STYLES[status] ?? NEUTRAL_STYLE
  const label = children ?? (status ? status.replace(/_/g, ' ') : '')

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style} ${className}`}>
      {label}
    </span>
  )
}
