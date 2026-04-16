import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Button from './Button'
import { getNotifications, markNotificationRead } from '../../features/notifications/notificationAPI'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true

    const loadNotifications = async () => {
      try {
        const response = await getNotifications()
        if (!active) return
        setNotifications(response?.notifications || [])
        setUnreadCount(response?.unreadCount || 0)
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [user])

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/create', label: 'Create Project' },
    { to: '/validation', label: 'Validation' },
    { to: '/leaderboard', label: 'Leaderboard' }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleOpenNotification = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationRead(notification._id)
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(prev - 1, 0))
      }
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
    } catch (error) {
      console.error('Failed to open notification:', error)
    }
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to={user ? "/dashboard" : "/"} className="group">
              <span className="collab-logo-text gradient-text transition-opacity duration-300 group-hover:opacity-90">
                Collab
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-sm font-medium transition-all duration-200 py-2 px-3 rounded-lg ${
                    isActive(link.to)
                      ? 'text-primary bg-primary/10 border border-primary/15'
                      : 'text-text-secondary hover:text-primary hover:bg-primary/5 border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-card text-text-primary hover:bg-bg-secondary transition-colors duration-200"
                    aria-label="Toggle notifications"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a2.5 2.5 0 01-4.714 0M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
                      />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-error text-white text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 mt-3 w-[min(90vw,20rem)] sm:w-80 max-w-[90vw] rounded-xl border border-border bg-bg-card shadow-card p-3 z-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text-primary">Notifications</span>
                        <button
                          type="button"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-text-muted hover:text-text-primary"
                        >
                          Close
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="text-sm text-text-muted">No notifications yet.</div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {notifications.slice(0, 5).map((notification) => (
                            <button
                              key={notification._id}
                              type="button"
                              onClick={() => handleOpenNotification(notification)}
                              className={`w-full text-left rounded-lg border p-2 transition-colors ${
                                notification.isRead
                                  ? 'border-border bg-bg-secondary/40'
                                  : 'border-primary/40 bg-primary/10'
                              }`}
                            >
                              <div className="text-xs text-text-muted flex items-center justify-between">
                                <span>{notification.title}</span>
                                <span>{notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ''}</span>
                              </div>
                              <div className="text-sm text-text-secondary mt-1">{notification.message}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 text-right">
                        <Link to="/profile" className="text-xs text-primary hover:text-primary-hover">
                          View all
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <Link to="/profile" className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-accent flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-primary hover:text-primary transition-colors duration-300">
                    Hello, {user.name || user.email || 'User'}
                  </span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hover:bg-error/10 hover:text-error transition-all duration-300"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-primary/10 transition-all duration-300"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="transition-all duration-300"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-primary/10 transition-all duration-300"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className={`w-5 h-0.5 bg-text-primary transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <div className={`w-5 h-0.5 bg-text-primary transition-all duration-300 mt-1 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <div className={`w-5 h-0.5 bg-text-primary transition-all duration-300 mt-1 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 pt-4 glass-light rounded-b-2xl"
          >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-medium transition-all duration-200 py-3 px-4 rounded-xl ${
                      isActive(link.to)
                        ? 'text-primary bg-primary/10 border border-primary/15'
                        : 'text-text-secondary hover:text-primary hover:bg-primary/5 border border-transparent'
                    }`}
                  >
                    {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium transition-all duration-300 py-3 px-4 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/5"
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
