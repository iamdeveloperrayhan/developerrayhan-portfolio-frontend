import clsx from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Numeric pagination derived from a DRF `count` + page size.
export default function Pagination({ count = 0, page = 1, pageSize = 10, onChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  if (totalPages <= 1) return null

  // Compact window of pages around the current one.
  const pages = []
  const push = (p) => pages.push(p)
  const window = 1
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - window && p <= page + window)) push(p)
    else if (pages[pages.length - 1] !== '…') push('…')
  }

  const go = (p) => p >= 1 && p <= totalPages && p !== page && onChange(p)

  const btn =
    'grid h-10 min-w-10 place-items-center rounded-xl border border-line px-3 text-sm font-medium transition-colors'

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button className={clsx(btn, 'disabled:opacity-40')} onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 text-muted">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
            className={clsx(
              btn,
              p === page
                ? 'border-transparent bg-gradient-brand text-white shadow-glow'
                : 'text-muted hover:bg-surface-2 hover:text-body'
            )}
          >
            {p}
          </button>
        )
      )}
      <button className={clsx(btn, 'disabled:opacity-40')} onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
