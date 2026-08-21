import { forwardRef, useId } from 'react'
import { AlertCircle } from 'lucide-react'

export const Input = forwardRef(function Input(
  { label, error, hint, id, className = '', containerClassName = '', ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={containerClassName}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        className={`h-11 w-full rounded-md border bg-white px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
          error ? 'border-danger-500 focus:border-danger-500' : 'border-neutral-200 focus:border-brand-500'
        } ${className}`}
        {...props}
      />
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
