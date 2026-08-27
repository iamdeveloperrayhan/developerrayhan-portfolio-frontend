import axios from 'axios'
import { tokens, getVisitorId } from './tokens'
// -----------------------------------------------
//                 Base URL
// -----------------------------------------------
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

// Single shared axios instance for the whole app.
const api = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } })

// A bare client (no interceptors) used for the refresh call itself, so a failed
// refresh can't recurse back through the response interceptor.
const refreshClient = axios.create({ baseURL })

// --- Request: attach the bearer token + visitor id -------------------------
api.interceptors.request.use((config) => {
  const access = tokens.access
  if (access) config.headers.Authorization = `Bearer ${access}`
  config.headers['X-Visitor-Id'] = getVisitorId()
  return config
})

// --- Response: transparent single-flight token refresh on 401 --------------
let refreshing = null

function onLoggedOut() {
  tokens.clear()
  // Let the AuthProvider react (clear user, bounce protected routes).
  window.dispatchEvent(new CustomEvent('auth:logout'))
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    const isAuthEndpoint =
      config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh')

    if (response?.status === 401 && !config._retry && !isAuthEndpoint && tokens.refresh) {
      config._retry = true
      try {
        if (!refreshing) {
          refreshing = refreshClient
            .post('/auth/refresh/', { refresh: tokens.refresh })
            .then((r) => {
              tokens.set({ access: r.data.access, refresh: r.data.refresh })
              return r.data.access
            })
            .finally(() => {
              refreshing = null
            })
        }
        const newAccess = await refreshing
        config.headers.Authorization = `Bearer ${newAccess}`
        return api(config)
      } catch {
        onLoggedOut()
      }
    }
    return Promise.reject(error)
  }
)

// Normalizes a DRF error payload into a single readable string.
export function apiError(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  const first = Object.values(data)[0]
  if (Array.isArray(first)) return first[0]
  if (typeof first === 'string') return first
  return fallback
}

export default api
