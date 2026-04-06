import React, { useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import useAuth from './hooks/useAuth'
import Navbar from './components/common/Navbar'
import Button from './components/common/Button'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import ProjectDetail from './pages/ProjectDetail'
import Validation from './pages/Validation'
import GiveFeedback from './pages/GiveFeedback'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import AdminDashboard from './pages/AdminDashboard'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Legal from './pages/Legal'
import LegalDoc from './pages/LegalDoc'

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

// Protected route for authenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" />
}

// Route for unauthenticated users (redirect if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  return user ? <Navigate to="/dashboard" /> : children
}

function Layout({ children }) {
  const target = useRef({ x: 50, y: 50 })
  const position = useRef({ x: 50, y: 50 })
  const raf = useRef(null)

  useEffect(() => {
    const onMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 100
      const y = (event.clientY / window.innerHeight) * 100
      target.current.x = clamp(x, 0, 100)
      target.current.y = clamp(y, 0, 100)
      if (!raf.current) {
        raf.current = requestAnimationFrame(update)
      }
    }

    const update = () => {
      position.current.x += (target.current.x - position.current.x) * 0.15
      position.current.y += (target.current.y - position.current.y) * 0.15
      document.documentElement.style.setProperty('--x', `${position.current.x}%`)
      document.documentElement.style.setProperty('--y', `${position.current.y}%`)
      raf.current = null
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-bg-main overflow-hidden">
      <div className="cursor-glow" />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Layout><Landing /></Layout></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Layout><Login /></Layout></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Layout><Register /></Layout></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><Layout><CreateProject /></Layout></ProtectedRoute>} />
      <Route path="/project/:id" element={<ProtectedRoute><Layout><ProjectDetail /></Layout></ProtectedRoute>} />
      <Route path="/validation" element={<ProtectedRoute><Layout><Validation /></Layout></ProtectedRoute>} />
      <Route path="/validation/:id/feedback" element={<ProtectedRoute><Layout><GiveFeedback /></Layout></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/verify-email" element={<PublicRoute><Layout><VerifyEmail /></Layout></PublicRoute>} />
      <Route path="/forgot" element={<PublicRoute><Layout><ForgotPassword /></Layout></PublicRoute>} />
      <Route path="/reset" element={<PublicRoute><Layout><ResetPassword /></Layout></PublicRoute>} />
      <Route path="/legal" element={<Layout><Legal /></Layout>} />
      <Route path="/legal/:slug" element={<Layout><LegalDoc /></Layout>} />
      <Route
        path="*"
        element={(
          <Layout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-3">
              <h1 className="text-2xl font-bold text-text-primary">Page not found</h1>
              <p className="text-text-secondary max-w-md">
                The page you are looking for doesn&apos;t exist or has moved.
              </p>
              <Link to="/dashboard">
                <Button variant="primary" size="sm">Go to Dashboard</Button>
              </Link>
            </div>
          </Layout>
        )}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
