import React from 'react'
import { motion } from 'framer-motion'

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'
  const variants = {
    primary: 'btn-primary-glow border-transparent text-white',
    secondary: 'btn-secondary-surface',
    ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-primary/10 hover:text-primary',
    default: 'btn-secondary-surface',
    danger: 'border-transparent bg-error text-white hover:bg-error/90 shadow-soft',
    innovation: 'border-transparent bg-secondary text-white hover:bg-secondary-hover shadow-glow-violet',
  }
  const sizes = {
    xs: 'text-xs h-8 px-3 rounded-lg',
    sm: 'text-sm h-9 px-4 rounded-lg',
    md: 'text-sm h-11 px-5',
    lg: 'text-base h-12 px-6',
  }

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 0, scale: 0.99 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
