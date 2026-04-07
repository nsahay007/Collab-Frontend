import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import useAuth from '../hooks/useAuth'
import { register as registerAPI } from '../features/auth/authAPI'
import { getAllColleges } from '../features/college/collegeAPI'
import { sanitizeText, sanitizeList } from '../utils/sanitize'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [colleges, setColleges] = useState([])
  const [customSkill, setCustomSkill] = useState('')
  const [showCustomSkill, setShowCustomSkill] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college_id: '',
    customCollegeName: '',
    phone: '',
    course: '',
    yearOfStudy: '',
    skills: [],
    primaryCategory: ''
  })

  const categories = [
    'Tech & Product',
    'Business & Startup', 
    'Design & Creative',
    'Marketing & Content',
    'Services & Operations'
  ]

  const years = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    '5th Year',
    'Graduate'
  ]

  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'Express',
    'HTML', 'CSS', 'TypeScript', 'Vue.js', 'Angular', 'Docker',
    'Git', 'AWS', 'Figma', 'Adobe Creative Suite', 'Marketing',
    'Business Development', 'Project Management', 'Data Analysis'
  ]

  const toTitleCase = (value) => {
    return value
      .trim()
      .split(/\s+/)
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''))
      .filter(Boolean)
      .join(' ')
  }

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await getAllColleges()
        if (Array.isArray(data)) {
          const cleaned = data.filter((college) => {
            const name = college.name || ''
            return !/test/i.test(name) && !/^others?$/i.test(name)
          })
          setColleges(cleaned)
        } else {
          setColleges([])
        }
      } catch (err) {
        console.error('Failed to fetch colleges:', err)
      }
    }
    fetchColleges()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSkillChange = (e) => {
    const value = e.target.value
    if (value === '__other__') {
      setShowCustomSkill(true)
      e.target.value = ''
      return
    }
    if (value && !formData.skills.includes(value)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, value]
      }))
    }
    setShowCustomSkill(false)
    e.target.value = ''
  }

  const addCustomSkill = () => {
    const trimmed = customSkill.trim()
    if (!trimmed) return
    if (formData.skills.includes(trimmed)) {
      setCustomSkill('')
      return
    }
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, trimmed]
    }))
    setCustomSkill('')
    setShowCustomSkill(false)
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.name || !formData.email || !formData.password || !formData.college_id || 
        !formData.course || !formData.yearOfStudy || !formData.primaryCategory ||
        (formData.college_id === 'others' && !formData.customCollegeName.trim())) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const payload = {
        ...formData,
        name: sanitizeText(formData.name),
        email: sanitizeText(formData.email),
        course: sanitizeText(formData.course),
        yearOfStudy: sanitizeText(formData.yearOfStudy),
        primaryCategory: sanitizeText(formData.primaryCategory),
        phone: sanitizeText(formData.phone || ''),
        skills: sanitizeList(formData.skills),
        customCollegeName: formData.college_id === 'others'
          ? toTitleCase(formData.customCollegeName)
          : formData.customCollegeName
      }
      const response = await registerAPI(payload)
      // Redirect to OTP verification instead of direct login
      navigate('/verify-email', { state: { email: formData.email, message: response?.data?.message } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8">
      <Card className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create Account</h1>
          <p className="text-text-secondary">Join Collab and build startups with your college network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email *
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
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Password *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
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

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-lg border border-border bg-bg-card p-1 text-text-muted shadow-sm hover:text-text-primary transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                College *
              </label>
              <select
                name="college_id"
                value={formData.college_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select your college</option>
                {colleges.map(college => (
                  <option key={college._id} value={college._id}>
                    {college.name}
                  </option>
                ))}
                <option value="others">Others</option>
              </select>
            </div>

            {/* Custom college name input - shown when "Others" is selected */}
            {formData.college_id === 'others' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  College Name *
                </label>
                <Input
                  type="text"
                  name="customCollegeName"
                  value={formData.customCollegeName}
                  onChange={handleChange}
                  placeholder="Enter your college name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Course *
              </label>
              <Input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="Enter your course"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Year of Study *
              </label>
              <select
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select your year</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Primary Interest *
              </label>
              <select
                name="primaryCategory"
                value={formData.primaryCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select your primary interest</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Skills
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-error hover:text-error/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  onChange={handleSkillChange}
                  className="px-4 py-2 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Add a skill...</option>
                  {commonSkills.filter(skill => !formData.skills.includes(skill)).map(skill => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                  <option value="__other__">Other</option>
                </select>
              </div>
              {showCustomSkill && (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add other skill"
                  />
                  <Button type="button" variant="secondary" onClick={addCustomSkill}>
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-text-muted bg-bg-secondary p-4 rounded-lg">
            <p className="font-medium mb-2">Password requirements:</p>
            <ul className="space-y-1">
              <li>• At least 8 characters</li>
              <li>• One uppercase letter</li>
              <li>• One lowercase letter</li>
              <li>• One number</li>
              <li>• One symbol (!@#$%^&*)</li>
            </ul>
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
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-accent font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
