import { Star } from 'lucide-react'

export function RatingChip({ rating, className = '' }) {
  const value = Number(rating ?? 0)

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-accent-500 px-1.5 py-0.5 text-xs font-bold text-white ${className}`}
    >
      <Star size={11} fill="currentColor" strokeWidth={0} />
      {value.toFixed(1)}
    </span>
  )
}
