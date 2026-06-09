import { useState, createContext, useContext, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('fd_token'))
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fd_user'))
    } catch {
      return null
    }
  })

  const login = useCallback(async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password })
    const jwt = res.data.token
    const payload = JSON.parse(atob(jwt.split('.')[1]))
    const userData = { id: payload.id, username: payload.username, role: payload.role }
    localStorage.setItem('fd_token', jwt)
    localStorage.setItem('fd_user', JSON.stringify(userData))
    setToken(jwt)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fd_token')
    localStorage.removeItem('fd_user')
    setToken(null)
    setUser(null)
  }, [])

  const authAxios = axios.create()
  authAxios.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authAxios }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
