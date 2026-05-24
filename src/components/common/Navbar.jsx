import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuth from '../../hooks/useAuth'
import Button from './Button'
import NavLinkPill from './NavLinkPill'
import ProfileMenu from './ProfileMenu'
import ThemeSwitch from './ThemeSwitch'
import BrandLogo from './BrandLogo'
import { getNotifications, markNotificationRead } from '../../features/notifications/notificationAPI'

const AUTH_NAV = [
  { to: '/build', label: 'Build', match: ['/build', '/create', '/project'], emphasis: true },
  { to: '/discover', label: 'Discover', match: ['/discover'] },
  { to: '/feed', label: 'Feed', match: ['/feed', '/dashboard'] },
  { to: '/opportunities', label: 'Opportunities', match: ['/opportunities'] },
]

function IconButton({ children, label, onClick, className = '', badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`nav-icon-btn ${className}`}
    >
      {children}
      {badge}
    </button>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [bellWiggle, setBellWiggle] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const profileRef = useRef(null)
  const prevUnreadRef = useRef(0)

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const homeTo = user ? '/feed' : '/'

  const isNavActive = (link) => {
    const path = location.pathname
    return link.match.some((prefix) => {
      if (prefix === '/project') return path.startsWith('/project')
      return path === prefix || path.startsWith(`${prefix}/`)
    })
  }

  const notifRef = useRef(null)

  useEffect(() => {
    setMobileOpen(false)
    setShowNotifications(false)
    setShowProfile(false)
  }, [location.pathname])

  useEffect(() => {
    if (!showNotifications) return undefined
    const handleClick = (e) => {
      if (notifRef.current?.contains(e.target)) return
      setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showNotifications])

  useEffect(() => {
    if (!user) return undefined
    let active = true

    const load = async () => {
      try {
        const response = await getNotifications()
        if (!active) return
        const count = response?.unreadCount || 0
        if (count > prevUnreadRef.current) {
          setBellWiggle(true)
          window.setTimeout(() => setBellWiggle(false), 450)
        }
        prevUnreadRef.current = count
        setNotifications(response?.notifications || [])
        setUnreadCount(count)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }

    load()
    const interval = setInterval(load, 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [user])

  const handleOpenNotification = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationRead(notification._id)
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(prev - 1, 0))
      }
      setShowNotifications(false)
      if (notification.actionUrl) navigate(notification.actionUrl)
    } catch (err) {
      console.error('Failed to open notification:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <>
      <header className="collab-navbar sticky top-0 z-50">
        <div className="collab-navbar-inner max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[68px] items-center gap-6">
            {/* Left — logo */}
            <Link
              to={homeTo}
              className="collab-logo-link shrink-0 group flex items-center mr-1 sm:mr-2"
              aria-label="Collab home"
            >
              <BrandLogo size="nav" className="transition-opacity duration-200 group-hover:opacity-90" />
            </Link>

            {/* Center — primary nav (authenticated) */}
            {user && (
              <nav
                className="hidden lg:flex flex-1 items-center justify-center gap-1"
                aria-label="Main"
              >
                {AUTH_NAV.map((link) => (
                  <NavLinkPill
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    isActive={isNavActive(link)}
                    emphasis={link.emphasis}
                  />
                ))}
              </nav>
            )}

            {!user && <div className="flex-1" />}

            {/* Right — actions */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {user ? (
                <>
                  <div className="relative" ref={notifRef}>
                    <motion.div animate={bellWiggle ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }} transition={{ duration: 0.4 }}>
                      <IconButton
                        label="Notifications"
                        onClick={() => {
                          setShowProfile(false)
                          setShowNotifications((p) => !p)
                        }}
                        badge={
                          unreadCount > 0 ? (
                            <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                          ) : null
                        }
                      >
                        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a2.5 2.5 0 01-4.714 0M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                        </svg>
                      </IconButton>
                    </motion.div>

                    {showNotifications && (
                      <div className="nav-dropdown absolute right-0 mt-2 w-[min(92vw,20rem)] p-3">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <span className="text-sm font-semibold text-text-primary">Notifications</span>
                          <button type="button" onClick={() => setShowNotifications(false)} className="text-xs text-text-muted hover:text-text-primary">
                            Close
                          </button>
                        </div>
                        {notifications.length === 0 ? (
                          <p className="text-sm text-text-muted px-1 py-4 text-center">No notifications yet</p>
                        ) : (
                          <div className="max-h-72 overflow-y-auto space-y-1.5">
                            {notifications.slice(0, 8).map((n) => (
                              <button
                                key={n._id}
                                type="button"
                                onClick={() => handleOpenNotification(n)}
                                className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors duration-150 ${
                                  n.isRead ? 'hover:bg-bg-secondary/80' : 'bg-primary/8 hover:bg-primary/12 border border-primary/15'
                                }`}
                              >
                                <p className="text-xs font-medium text-text-primary">{n.title}</p>
                                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                              </button>
                            ))}
                          </div>
                        )}
                        <Link to="/profile" onClick={() => setShowNotifications(false)} className="block text-center text-xs text-primary mt-3 hover:text-primary-hover">
                          View all
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="relative hidden sm:block">
                    <button
                      ref={profileRef}
                      type="button"
                      onClick={() => {
                        setShowNotifications(false)
                        setShowProfile((p) => !p)
                      }}
                      aria-label="Account menu"
                      aria-expanded={showProfile}
                      className="nav-avatar-btn"
                    >
                      <span className="nav-avatar">{avatarInitial}</span>
                    </button>
                    <ProfileMenu
                      open={showProfile}
                      onClose={() => setShowProfile(false)}
                      anchorRef={profileRef}
                    />
                  </div>

                  <button
                    type="button"
                    className="lg:hidden nav-icon-btn"
                    aria-label="Open menu"
                    onClick={() => setMobileOpen((p) => !p)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                      {mobileOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {user && mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border collab-navbar-mobile"
          >
            <nav className="px-4 py-4 space-y-1" aria-label="Mobile">
              {AUTH_NAV.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                    isNavActive(link)
                      ? link.emphasis
                        ? 'nav-pill-build text-primary'
                        : 'nav-pill-active text-text-primary'
                      : 'text-text-muted hover:text-text-secondary hover:bg-primary/6'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-border space-y-1 sm:hidden">
                <button type="button" onClick={() => { setShowProfile(true); setMobileOpen(false) }} className="w-full text-left px-4 py-3 text-sm text-text-muted rounded-lg hover:bg-primary/6">
                  Account
                </button>
                <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-error rounded-lg hover:bg-error/10">
                  Logout
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Mobile profile menu (when opened from drawer) */}
      {user && showProfile && (
        <div className="sm:hidden fixed inset-0 z-[55] flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowProfile(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-elevated p-4 shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="nav-avatar">{avatarInitial}</span>
              <div>
                <p className="font-medium text-text-primary">{user.name || 'Builder'}</p>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
            </div>
            <Link to="/profile" onClick={() => setShowProfile(false)} className="block py-2.5 text-sm text-text-secondary">Profile</Link>
            <Link to="/settings" onClick={() => setShowProfile(false)} className="block py-2.5 text-sm text-text-secondary">Settings</Link>
            <div className="py-3 border-y border-border my-2">
              <ThemeSwitch />
            </div>
            <button type="button" onClick={handleLogout} className="w-full py-2.5 text-sm text-error text-left">Logout</button>
          </div>
        </div>
      )}
    </>
  )
}
