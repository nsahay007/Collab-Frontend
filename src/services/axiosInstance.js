import axios from 'axios'
import { apiBaseUrl } from '../config/api'

const instance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const path = window.location.pathname
      const authPages = ['/login', '/register', '/verify-email', '/forgot', '/reset']
      if (!authPages.includes(path)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default instance
