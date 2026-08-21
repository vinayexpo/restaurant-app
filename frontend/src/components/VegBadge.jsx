export function VegBadge({ className = '' }) {
  return (
    <span
      role="img"
      aria-label="Vegetarian"
      title="Vegetarian"
      className={`inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border-2 border-accent-500 ${className}`}
    >
      <span className="size-1.5 rounded-full bg-accent-500" />
    </span>
  )
}

export function NonVegBadge({ className = '' }) {
  return (
    <span
      role="img"
      aria-label="Non-vegetarian"
      title="Non-vegetarian"
      className={`inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border-2 border-danger-500 ${className}`}
    >
      <span
        className="size-0 border-x-[3px] border-b-[6px] border-x-transparent border-b-danger-500"
        style={{ marginTop: '-1px' }}
      />
    </span>
  )
}
