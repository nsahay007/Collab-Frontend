import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../../hooks/useAuth'
import ThemeSwitch from './ThemeSwitch'

export default function ProfileMenu({ open, onClose, anchorRef }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handleClick = (e) => {
      if (
        menuRef.current?.contains(e.target) ||
        anchorRef?.current?.contains(e.target)
      ) {
        return
      }
      onClose()
    }

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose, anchorRef])

  const handleLogout = () => {
    onClose()
    logout()
    navigate('/login')
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-bg-elevated shadow-elevated py-2 z-50 origin-top-right"
        >
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'Builder'}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <MenuLink to="/profile" onClick={onClose}>Profile</MenuLink>
            <MenuLink to="/profile" onClick={onClose}>Settings</MenuLink>
          </div>

          <div className="px-4 py-3 border-t border-border">
            <ThemeSwitch />
          </div>

          <div className="px-2 pt-1 border-t border-border">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-error rounded-lg hover:bg-error/10 transition-colors duration-150"
            >
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MenuLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary/8 transition-colors duration-150"
    >
      {children}
    </Link>
  )
}
