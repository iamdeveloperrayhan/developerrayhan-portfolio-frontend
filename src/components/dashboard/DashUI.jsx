import clsx from 'clsx'

// Consistent page header for dashboard screens.
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-body sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex shrink-0 gap-3">{children}</div>}
    </div>
  )
}

const toneStyles = {
  accent: 'bg-gradient-brand-soft text-accent',
  green: 'bg-emerald-500/10 text-emerald-500',
  amber: 'bg-amber-500/10 text-amber-500',
  sky: 'bg-sky-500/10 text-sky-500',
  pink: 'bg-pink-500/10 text-pink-500',
}

// A single stat tile.
export function StatCard({ label, value, icon: Icon, tone = 'accent', hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className={clsx('grid h-11 w-11 place-items-center rounded-xl', toneStyles[tone])}>
          {Icon && <Icon size={20} />}
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-body">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted/80">{hint}</p>}
    </div>
  )
}
