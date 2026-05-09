import axios from 'axios'
import { apiBaseUrl } from '../config/api'

const instance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      const path = window.location.pathname
      const authPages = ['/login', '/register', '/verify-email', '/forgot', '/reset']
      const isPublicProofRoute = /^\/project\/[^/]+\/proof$/.test(path)
      if (!authPages.includes(path) && !isPublicProofRoute) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default instance
