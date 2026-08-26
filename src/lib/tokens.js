// Central localStorage keys + tiny token helpers.
const ACCESS_KEY = 'devfolio_access'
const REFRESH_KEY = 'devfolio_refresh'
const VISITOR_KEY = 'devfolio_visitor_id'

export const tokens = {
  get access() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set({ access, refresh }) {
    if (access) localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

// A stable per-browser id used for anonymous likes and view de-duplication.
export function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(16).slice(2)}`
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}
