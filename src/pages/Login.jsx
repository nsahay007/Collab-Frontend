import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import useAuth from '../hooks/useAuth'
import { login as loginAPI, googleAuth as googleAuthAPI, verifyAdminTwoFactor } from '../features/auth/authAPI'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const googleButtonRef = useRef(null)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorToken, setTwoFactorToken] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleGoogleCredential = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google sign-in failed. Please try again.')
      return
    }

    setGoogleLoading(true)
    setError('')

    try {
      const response = await googleAuthAPI({ credential: credentialResponse.credential })
      if (response?.data?.twoFactorRequired) {
        setTwoFactorRequired(true)
        setTwoFactorToken(response.data.twoFactorToken)
        return
      }
      if (!response?.data?.user) {
        throw new Error('Invalid Google login response')
      }
      login(response.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Google login failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  useEffect(() => {
    if (!googleClientId || twoFactorRequired) return undefined

    let cancelled = false
    let script

    const initGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          void handleGoogleCredential(response)
        }
      })
      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'continue_with',
        shape: 'pill'
      })
      setGoogleReady(true)
    }

    if (window.google?.accounts?.id) {
      initGoogleButton()
      return () => {
        cancelled = true
      }
    }

    script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogleButton
    script.onerror = () => {
      if (!cancelled) {
        setError('Unable to load Google sign-in. Please refresh.')
      }
    }
    document.head.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [googleClientId, twoFactorRequired])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (twoFactorRequired) {
        const response = await verifyAdminTwoFactor({ token: twoFactorToken, code: twoFactorCode })
        if (!response?.data?.user) {
          throw new Error('Invalid 2FA response')
        }
        login(response.data.user)
        navigate('/dashboard')
        return
      }

      const response = await loginAPI(formData)
      if (response?.data?.twoFactorRequired) {
        setTwoFactorRequired(true)
        setTwoFactorToken(response.data.twoFactorToken)
        setError('')
        return
      }
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
            disabled={twoFactorRequired || googleLoading}
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
                disabled={twoFactorRequired || googleLoading}
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

          {twoFactorRequired && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Admin 2FA Code
              </label>
              <Input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="6-digit code"
                required
              />
              <p className="mt-2 text-xs text-text-muted">
                Enter the code from your authenticator app to finish sign in.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <Button 
            variant="primary" 
            className="w-full" 
            type="submit"
            disabled={loading || googleLoading}
          >
            {loading ? 'Signing in...' : (twoFactorRequired ? 'Verify 2FA' : 'Sign In')}
          </Button>

          {!twoFactorRequired && googleClientId && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wide text-text-muted">or continue with</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex justify-center">
                <div ref={googleButtonRef} />
              </div>
              {!googleReady && (
                <p className="text-xs text-text-muted text-center">Loading Google sign-in...</p>
              )}
              {googleLoading && (
                <p className="text-xs text-text-secondary text-center">Signing in with Google...</p>
              )}
            </div>
          )}
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
