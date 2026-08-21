import { forwardRef, useId } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

export const Select = forwardRef(function Select(
  { label, error, hint, id, className = '', containerClassName = '', children, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={containerClassName}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          className={`h-11 w-full appearance-none rounded-md border bg-white px-3.5 pr-9 text-sm text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
            error ? 'border-danger-500 focus:border-danger-500' : 'border-neutral-200 focus:border-brand-500'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      </div>
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-danger-500">
          <AlertCircle size={13} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>
      ) : null}
    </div>
  )
})
