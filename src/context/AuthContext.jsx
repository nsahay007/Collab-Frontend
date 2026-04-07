import React, { createContext, useState, useEffect } from 'react'
import axios from '../services/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const bootstrap = async () => {
      try {
        const response = await axios.get('/users/me')
        if (response?.data && isMounted) {
          setUser(response.data)
        }
      } catch (err) {
        if (isMounted) {
          setUser(null)
        }
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    bootstrap()
    return () => {
      isMounted = false
    }
  }, [])

  const login = (userData) => {
    if (userData) {
      setUser(userData)
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('user')
    try {
      await axios.post('/auth/logout')
    } catch (err) {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
