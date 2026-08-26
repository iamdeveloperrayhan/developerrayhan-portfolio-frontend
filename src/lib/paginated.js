// The API paginates most list endpoints ({ count, next, previous, results })
// but returns plain arrays for a few (categories, tags). These helpers let the
// UI treat both shapes uniformly.

export function asList(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

export function pageCount(data, fallback = 0) {
  if (data && typeof data.count === 'number') return data.count
  if (Array.isArray(data)) return data.length
  return fallback
}
