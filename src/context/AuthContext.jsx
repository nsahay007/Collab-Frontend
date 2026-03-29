import React, { createContext, useState, useEffect } from 'react'
import axios from '../services/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const bootstrap = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`
      }

      if (token && userData) {
        try {
          if (isMounted) {
            setUser(JSON.parse(userData))
          }
        } catch (err) {
          console.error('Failed to parse user data:', err)
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
      } else if (token && !userData) {
        try {
          const response = await axios.get('/users/me')
          if (response?.data && isMounted) {
            setUser(response.data)
            localStorage.setItem('user', JSON.stringify(response.data))
          }
        } catch (err) {
          console.error('Failed to load user profile:', err)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
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

  const login = (userData, token) => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      localStorage.setItem('token', token)
    }
    if (userData) {
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    delete axios.defaults.headers.common.Authorization
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
