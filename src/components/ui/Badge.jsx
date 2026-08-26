import clsx from 'clsx'

const tones = {
  default: 'badge',
  accent: 'badge-accent',
  green: 'inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500',
  amber: 'inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500',
  red: 'inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500',
}

export default function Badge({ tone = 'default', className, children, ...props }) {
  return (
    <span className={clsx(tones[tone] || tones.default, className)} {...props}>
      {children}
    </span>
  )
}
