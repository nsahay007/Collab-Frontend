import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { springSnappy } from '../../utils/motion'

export default function NavLinkPill({ to, label, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 ${
        isActive ? 'text-primary' : 'text-text-secondary hover:text-primary hover:bg-primary/8'
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="collab-nav-pill"
          className="absolute inset-0 rounded-lg nav-active -z-0"
          transition={springSnappy}
        />
      )}
      <span className="relative z-10">{label}</span>
    </Link>
  )
}
