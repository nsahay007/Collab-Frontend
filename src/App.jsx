import React, { Suspense, lazy } from 'react'
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
import SEO from './components/common/SEO'
import Footer from './components/common/Footer'

const lazyWithRefresh = (factory) => lazy(async () => {
  try {
    return await factory()
  } catch (error) {
    const message = String(error?.message || error || '')
    const isChunkError = /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(message)
    if (isChunkError && !sessionStorage.getItem('collab:chunk-refresh')) {
      sessionStorage.setItem('collab:chunk-refresh', '1')
      window.location.reload()
    }
    throw error
  }
})

const Landing = lazyWithRefresh(() => import('./pages/Landing'))
const Login = lazyWithRefresh(() => import('./pages/Login'))
const Register = lazyWithRefresh(() => import('./pages/Register'))
const Feed = lazyWithRefresh(() => import('./pages/Feed'))
const Build = lazyWithRefresh(() => import('./pages/Build'))
const Discover = lazyWithRefresh(() => import('./pages/Discover'))
const Opportunities = lazyWithRefresh(() => import('./pages/Opportunities'))
const CreateProject = lazyWithRefresh(() => import('./pages/CreateProject'))
const ProjectDetail = lazyWithRefresh(() => import('./pages/ProjectDetail'))
const FinalStartupPackage = lazyWithRefresh(() => import('./pages/FinalStartupPackage'))
const ProjectPackage = lazyWithRefresh(() => import('./pages/ProjectPackage'))
const Profile = lazyWithRefresh(() => import('./pages/Profile'))
const Settings = lazyWithRefresh(() => import('./pages/Settings'))
const AdminDashboard = lazyWithRefresh(() => import('./pages/AdminDashboard'))
const AdminProjects = lazyWithRefresh(() => import('./pages/AdminProjects'))
const AdminHackathons = lazyWithRefresh(() => import('./pages/AdminHackathons'))
const AdminLogs = lazyWithRefresh(() => import('./pages/AdminLogs'))
const VerifyEmail = lazyWithRefresh(() => import('./pages/VerifyEmail'))
const VerifyCertificate = lazyWithRefresh(() => import('./pages/VerifyCertificate'))
const ForgotPassword = lazyWithRefresh(() => import('./pages/ForgotPassword'))
const ResetPassword = lazyWithRefresh(() => import('./pages/ResetPassword'))
const Legal = lazyWithRefresh(() => import('./pages/Legal'))
const LegalDoc = lazyWithRefresh(() => import('./pages/LegalDoc'))
const Security = lazyWithRefresh(() => import('./pages/Security'))
const StaticPage = lazyWithRefresh(() => import('./pages/StaticPage'))

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
  return user ? <Navigate to="/build" /> : children
}

function Layout({ children }) {
  const location = useLocation()
  const hideFooter = /^\/project\/[^/]+\/?$/.test(location.pathname)

  return (
    <div className="relative min-h-screen bg-bg-main text-text-primary">
      <SEO />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative min-h-[50vh]">
        <RouteErrorBoundary resetKey={location.pathname}>
          <PageTransition>{children}</PageTransition>
        </RouteErrorBoundary>
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
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
        <Route path="/project/:id/project-package" element={<ProtectedRoute><Layout><ProjectPackage /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute><Layout><AdminLogs /></Layout></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute><Layout><AdminProjects /></Layout></ProtectedRoute>} />
        <Route path="/admin/hackathons" element={<ProtectedRoute><Layout><AdminHackathons /></Layout></ProtectedRoute>} />
        <Route path="/verify-email" element={<PublicRoute><Layout><VerifyEmail /></Layout></PublicRoute>} />
        <Route path="/verify/:certificateId" element={<Layout><VerifyCertificate /></Layout>} />
        <Route path="/forgot" element={<PublicRoute><Layout><ForgotPassword /></Layout></PublicRoute>} />
        <Route path="/reset" element={<PublicRoute><Layout><ResetPassword /></Layout></PublicRoute>} />
        <Route path="/legal" element={<Layout><Legal /></Layout>} />
        <Route path="/legal/:slug" element={<Layout><LegalDoc /></Layout>} />
        <Route path="/security" element={<Layout><Security /></Layout>} />
        <Route path="/about" element={<Layout><StaticPage /></Layout>} />
        <Route path="/contact" element={<Layout><StaticPage /></Layout>} />
        <Route path="/faq" element={<Layout><StaticPage /></Layout>} />
        <Route path="/help" element={<Layout><StaticPage /></Layout>} />
        <Route path="/support" element={<Layout><StaticPage /></Layout>} />
        <Route path="/report-bug" element={<Layout><StaticPage /></Layout>} />
        <Route path="/feedback" element={<Layout><StaticPage /></Layout>} />
        <Route path="/privacy" element={<Layout><StaticPage /></Layout>} />
        <Route path="/cookies" element={<Layout><StaticPage /></Layout>} />
        <Route path="/community-guidelines" element={<Layout><StaticPage /></Layout>} />
        <Route path="/disclaimer" element={<Layout><StaticPage /></Layout>} />
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
    </Suspense>
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
