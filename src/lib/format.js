// Small formatting helpers.

export function formatDate(value, opts = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('en-US', opts)
  } catch {
    return ''
  }
}

export function formatMonthYear(value) {
  opts = {
      year: 'numeric',
      month: 'short'
    }
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-US', opts)
}

// "Jan 2022 – Present" style range from date strings.
export function dateRange(start, end, current) {
  const s = formatMonthYear(start)
  const e = current ? 'Present' : formatMonthYear(end)
  return e ? `${s} – ${e}` : s
}

export function relativeTime(value) {
  if (!value) return ''
  const diff = (Date.now() - new Date(value).getTime()) / 1000
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, secs] of units) {
    const v = Math.floor(diff / secs)
    if (v >= 1) return `${v} ${unit}${v > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export function compactNumber(n) {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n || 0)
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
