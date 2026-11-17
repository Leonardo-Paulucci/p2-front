import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import api from '../services/api'
import type { Usuario } from '../types'

type AuthContextType = {
  user: Usuario | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('crm_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me').then(res => setUser(res.data)).catch(() => {
      localStorage.removeItem('crm_token')
      setUser(null)
    }).finally(() => setLoading(false))

    const onUnauthorized = () => setUser(null)
    window.addEventListener('crm:unauthorized', onUnauthorized)
    return () => window.removeEventListener('crm:unauthorized', onUnauthorized)
  }, [])

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password })
    const token = res.data.accessToken
    localStorage.setItem('crm_token', token)
    const me = await api.get('/auth/me')
    setUser(me.data)
  }

  const logout = () => {
    localStorage.removeItem('crm_token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
