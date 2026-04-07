import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { verifyEmail, resendVerificationOTP } from '../features/auth/authAPI'
import useAuth from '../hooks/useAuth'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const queryEmail = new URLSearchParams(location.search).get('email') || ''
  const email = location.state?.email || queryEmail
  const initialMessage = location.state?.message || ''
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(initialMessage)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!otp) {
      setError('Please enter the OTP')
      return
    }

    setLoading(true)

    try {
      const response = await verifyEmail({ email, otp })
      login(response.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Email is missing. Please go back and register again.')
      return
    }
    setError('')
    setMessage('')
    setResending(true)
    try {
      const response = await resendVerificationOTP({ email })
      setMessage(response.data?.message || 'OTP resent. Please check your email.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Verify Email</h1>
          <p className="text-text-secondary">Enter the OTP sent to {email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">OTP</label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              required
            />
            <p className="mt-2 text-xs text-text-muted">Check your Spam/Junk folder if you don’t see the OTP.</p>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          {message && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{message}</div>}

          <Button variant="primary" className="w-full" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Didn't receive OTP?{' '}
            <button
              className="text-primary hover:text-accent font-medium"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Resending…' : 'Resend'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  )
}
