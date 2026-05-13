import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import axios from 'axios'
import type { AuthContextType, User } from '../types'

const AuthContext = createContext<AuthContextType | null>(null)
const AUTH_URL = 'http://127.0.0.1:8000'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const username = sessionStorage.getItem('username')
    const token    = sessionStorage.getItem('access_token')
    return token && username ? { username } : null
  })

  const login = useCallback(async (username: string, password: string) => {
    const body = new URLSearchParams({ username, password })
    const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
      `${AUTH_URL}/auth/login`, body,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    sessionStorage.setItem('access_token',  data.access_token)
    sessionStorage.setItem('refresh_token', data.refresh_token)
    sessionStorage.setItem('username',      username)
    setUser({ username })
  }, [])

  const logout = useCallback(async () => {
    const token = sessionStorage.getItem('access_token')
    try {
      if (token) await axios.post(`${AUTH_URL}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
    } catch { /* continúa aunque falle */ } finally {
      sessionStorage.clear()
      setUser(null)
    }
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe estar dentro de AuthProvider')
  return ctx
}
