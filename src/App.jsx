import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
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
import ProjectProof from './pages/ProjectProof'
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
  const location = useLocation()

  return (
    <div className="relative min-h-screen bg-bg-main">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
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
      <Route path="/project/:id/proof" element={<Layout><ProjectProof /></Layout>} />
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
