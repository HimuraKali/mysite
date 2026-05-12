import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, getToken, setToken } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        const token = getToken()
        if (!token) return
        const data = await apiFetch('/me', { token })
        if (!cancelled) setUser(data.user)
      } catch {
        setToken(null)
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => {
    return {
      ready,
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      register: ({ name, email, password }) => {
        return apiFetch('/auth/register', {
          method: 'POST',
          body: { name, email, password },
        }).then(({ token, user: u }) => {
          setToken(token)
          setUser(u)
          return u
        })
      },
      login: ({ email, password }) => {
        return apiFetch('/auth/login', {
          method: 'POST',
          body: { email, password },
        }).then(({ token, user: u }) => {
          setToken(token)
          setUser(u)
          return u
        })
      },
      logout: () => {
        setToken(null)
        setUser(null)
      },
    }
  }, [ready, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

