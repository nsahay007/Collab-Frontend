import React from 'react'
import { motion } from 'framer-motion'

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary text-white px-6 py-3 hover:bg-primary-hover active:scale-95',
    secondary: 'bg-bg-card text-text-primary border border-border px-5 py-2 hover:bg-bg-secondary',
    ghost: 'bg-transparent text-text-primary px-4 py-2 hover:bg-primary/10',
    default: 'bg-bg-secondary text-text-primary border border-border px-5 py-2 hover:bg-bg-card',
    danger: 'bg-error text-white px-6 py-3 hover:bg-error/90 active:scale-95'
  }
  const sizes = {
    xs: 'text-xs px-3 py-1.5 rounded-lg',
    sm: 'text-sm px-4 py-2 rounded-lg',
    md: '',
    lg: 'text-base px-7 py-3.5 rounded-xl'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${sizes[size] || ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
