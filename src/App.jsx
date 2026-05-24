import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { MotionToastProvider } from './components/common/MotionToast'
import PageTransition from './components/common/PageTransition'
import RouteErrorBoundary from './components/common/RouteErrorBoundary'
import { AuthSkeleton } from './components/common/Skeleton'
import useAuth from './hooks/useAuth'
import Navbar from './components/common/Navbar'
import Button from './components/common/Button'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Build from './pages/Build'
import Discover from './pages/Discover'
import Opportunities from './pages/Opportunities'
import CreateProject from './pages/CreateProject'
import ProjectDetail from './pages/ProjectDetail'
import FinalStartupPackage from './pages/FinalStartupPackage'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'
import VerifyEmail from './pages/VerifyEmail'
import VerifyCertificate from './pages/VerifyCertificate'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Legal from './pages/Legal'
import LegalDoc from './pages/LegalDoc'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="relative min-h-screen bg-bg-main">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AuthSkeleton />
        </main>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="relative min-h-screen bg-bg-main flex items-center justify-center px-4">
        <AuthSkeleton />
      </div>
    )
  }
  return user ? <Navigate to="/feed" /> : children
}

function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="relative min-h-screen bg-bg-main text-text-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative min-h-[50vh]">
        <RouteErrorBoundary resetKey={location.pathname}>
          <PageTransition>{children}</PageTransition>
        </RouteErrorBoundary>
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
      <Route path="/feed" element={<ProtectedRoute><Layout><Feed /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<Navigate to="/build" replace />} />
      <Route path="/build" element={<ProtectedRoute><Layout><Build /></Layout></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><Layout><Discover /></Layout></ProtectedRoute>} />
      <Route path="/opportunities" element={<ProtectedRoute><Layout><Opportunities /></Layout></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><Layout><CreateProject /></Layout></ProtectedRoute>} />
      <Route path="/project/:id" element={<ProtectedRoute><Layout><ProjectDetail /></Layout></ProtectedRoute>} />
      <Route path="/project/:id/package" element={<ProtectedRoute><Layout><FinalStartupPackage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/verify-email" element={<PublicRoute><Layout><VerifyEmail /></Layout></PublicRoute>} />
      <Route path="/verify/:certificateId" element={<Layout><VerifyCertificate /></Layout>} />
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
              <Link to="/build">
                <Button variant="primary" size="sm">Go to Build</Button>
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
      <MotionToastProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </MotionToastProvider>
    </ThemeProvider>
  )
}
