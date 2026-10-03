import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'))

  // On first load / refresh, restore the session if a token exists
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const saveSession = (data) => {
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const login = async (email, password) =>
    saveSession(await api('/auth/login', { method: 'POST', body: { email, password } }))

  // Signup only creates the account and emails a code; the session starts after verification.
  const signup = (name, email, password) =>
    api('/auth/signup', { method: 'POST', body: { name, email, password } })

  const verifyEmail = async (email, otp) =>
    saveSession(await api('/auth/verify-email', { method: 'POST', body: { email, otp } }))

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
