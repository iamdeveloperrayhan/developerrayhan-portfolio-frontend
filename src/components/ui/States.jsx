import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import Button from './Button'

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action, className }) {
  return (
    <div className={clsx('card flex flex-col items-center gap-3 px-6 py-16 text-center', className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand-soft text-accent">
        <Icon size={26} />
      </div>
      <h3 className="text-lg font-semibold text-body">{title}</h3>
      {message && <p className="max-w-sm text-sm text-muted">{message}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message = 'We couldn’t load this content.', onRetry, className }) {
  return (
    <div className={clsx('card flex flex-col items-center gap-3 px-6 py-16 text-center', className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-red-500">
        <AlertTriangle size={26} />
      </div>
      <h3 className="text-lg font-semibold text-body">Something went wrong</h3>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={15} /> Try again
        </Button>
      )}
    </div>
  )
}

/* --------------------------------- Skeletons ------------------------------ */
export function Skeleton({ className }) {
  return <div className={clsx('skeleton rounded-xl', className)} />
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6, className }) {
  return (
    <div className={clsx('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonLines({ lines = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={clsx('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}
