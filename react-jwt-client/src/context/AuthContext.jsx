import { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
const BASE_URL = 'http://127.0.0.1:8000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem('username')
    const token = localStorage.getItem('access_token')
    return token && username ? { username } : null
  })

  const login = useCallback(async (username, password) => {
    const body = new URLSearchParams({ username, password })
    const { data } = await axios.post(`${BASE_URL}/auth/login`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('username', username)
    setUser({ username })
  }, [])

  const logout = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    try {
      if (token) {
        await axios.post(
          `${BASE_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch {
      // continúa con el logout aunque falle la petición
    } finally {
      localStorage.clear()
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
