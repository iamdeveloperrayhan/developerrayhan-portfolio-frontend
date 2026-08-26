import clsx from 'clsx'
import { initials as toInitials } from '@/lib/format'

// Avatar that falls back to gradient initials when there's no image.
export default function Avatar({ src, name = '', size = 40, className }) {
  const dim = { width: size, height: size }
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={dim}
        className={clsx('rounded-full object-cover ring-2 ring-line', className)}
      />
    )
  }
  return (
    <span
      style={dim}
      className={clsx(
        'grid place-items-center rounded-full bg-gradient-brand font-semibold text-white',
        className
      )}
    >
      {toInitials(name) || '?'}
    </span>
  )
}
