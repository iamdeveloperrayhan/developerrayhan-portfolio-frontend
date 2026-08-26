import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

export function Spinner({ className, size = 20 }) {
  return <Loader2 size={size} className={clsx('animate-spin text-accent', className)} />
}

// Full-viewport loader used while restoring the auth session.
export function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg">
      <div className="relative">
        <div className="h-12 w-12 rounded-2xl bg-gradient-brand bg-[length:200%_200%] animate-gradient-pan" />
        <Loader2
          size={20}
          className="absolute inset-0 m-auto animate-spin text-white"
        />
      </div>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}

// Centered inline loader for page/section content.
export function Loading({ label }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-muted">
      <Spinner />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}
