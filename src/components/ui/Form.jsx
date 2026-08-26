import clsx from 'clsx'

// A labeled form field wrapper with optional error + hint text.
export function Field({ label, htmlFor, error, hint, required, children, className }) {
  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="ml-0.5 text-accent-2">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ className, invalid, ...props }) {
  return <input className={clsx('input', invalid && 'border-red-400 focus:ring-red-300', className)} {...props} />
}

export function Textarea({ className, invalid, rows = 5, ...props }) {
  return (
    <textarea
      rows={rows}
      className={clsx('input resize-y', invalid && 'border-red-400 focus:ring-red-300', className)}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }) {
  return (
    <select className={clsx('input appearance-none pr-10', className)} {...props}>
      {children}
    </select>
  )
}

// A styled checkbox + label row.
export function Checkbox({ label, className, ...props }) {
  return (
    <label className={clsx('flex cursor-pointer items-center gap-2.5 text-sm text-body', className)}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-line text-accent focus:ring-ring"
        {...props}
      />
      {label}
    </label>
  )
}
