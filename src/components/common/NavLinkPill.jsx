import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { springSnappy } from '../../utils/motion'

export default function NavLinkPill({ to, label, isActive, onClick, emphasis = false }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-[13px] font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'text-primary'
          : 'text-text-muted hover:text-text-secondary hover:bg-primary/6'
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="collab-nav-pill"
          className={`absolute inset-0 rounded-lg -z-0 ${
            emphasis ? 'nav-pill-build' : 'nav-pill-active'
          }`}
          transition={springSnappy}
        />
      )}
      <span className={`relative z-10 ${emphasis && !isActive ? 'text-text-secondary' : ''}`}>{label}</span>
    </Link>
  )
}
