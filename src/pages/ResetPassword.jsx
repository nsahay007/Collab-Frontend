import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { verifyResetOTP, resetPassword } from '../features/auth/authAPI'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    password: '',
    confirmPassword: ''
  })
  const [step, setStep] = useState('verifyOtp')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setMessage('')
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!formData.email || !formData.otp) {
      setError('Email and OTP are required')
      setLoading(false)
      return
    }

    try {
      await verifyResetOTP({ email: formData.email, otp: formData.otp })
      setMessage('OTP verified. Enter your new password.')
      setStep('resetPassword')
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { email, otp, password, confirmPassword } = formData
    if (!password || !confirmPassword) {
      setError('Please fill in all password fields')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await resetPassword({ email, otp, newPassword: password })
      setMessage('Password reset successful. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Reset Password</h1>
          <p className="text-text-secondary">Enter details to continue</p>
        </div>

        <form onSubmit={step === 'verifyOtp' ? handleVerifyOTP : handleReset} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Registered email"
              required
              disabled={Boolean(location.state?.email)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">OTP</label>
            <Input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="6-digit OTP"
              required
            />
            <p className="mt-2 text-xs text-text-muted">Check your Spam/Junk folder if you don’t see the OTP.</p>
          </div>

          {step === 'resetPassword' && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="New password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </>
          )}

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          {message && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{message}</div>}

          <Button variant="primary" className="w-full" type="submit" disabled={loading}>
            {loading ? 'Processing...' : step === 'verifyOtp' ? 'Verify OTP' : 'Reset Password'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Back to login?{' '}
            <Link to="/login" className="text-primary hover:text-accent font-medium">Sign in</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
