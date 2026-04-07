import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import useAuth from '../hooks/useAuth'
import { login as loginAPI } from '../features/auth/authAPI'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await loginAPI(formData)
      if (!response?.data?.user) {
        throw new Error('Invalid login response')
      }
      login(response.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h1>
          <p className="text-text-secondary mb-4">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-lg border border-border bg-bg-card p-1 text-text-muted shadow-sm hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 4.5L21 19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M10.5 10.1a3.2 3.2 0 0 0 4.4 4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M6.3 7.1C4 8.9 2.5 11 2 12c1.4 2.7 4.9 6 10 6 1.7 0 3.2-.4 4.5-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M14.1 6.2c.6-.1 1.2-.2 1.9-.2 5.1 0 8.6 3.3 10 6-.4.8-1.2 2.1-2.4 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2 12c1.4-2.7 4.9-6 10-6s8.6 3.3 10 6c-1.4 2.7-4.9 6-10 6s-8.6-3.3-10-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <Button 
            variant="primary" 
            className="w-full" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 text-right">
          <Link to="/forgot" className="text-primary hover:text-accent font-medium text-sm">
            Forgot Password?
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-accent font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
