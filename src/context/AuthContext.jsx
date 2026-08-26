import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { tokens } from '@/lib/tokens'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // restoring session on first load

  // Restore session: if we hold a token, ask the API who we are.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      if (!tokens.access) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/auth/me/')
        if (!cancelled) setUser(data)
      } catch {
        tokens.clear()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  // The api interceptor fires this when a refresh ultimately fails.
  useEffect(() => {
    const handler = () => setUser(null)
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    tokens.set({ access: data.access, refresh: data.refresh })
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      if (tokens.refresh) await api.post('/auth/logout/', { refresh: tokens.refresh })
    } catch {
      /* best-effort; clear locally regardless */
    }
    tokens.clear()
    setUser(null)
  }, [])

  const value = {
    user,
    setUser,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isOwner: !!user, // only the single superuser owner can ever log in
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
