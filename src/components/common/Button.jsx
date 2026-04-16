import React from 'react'
import { motion } from 'framer-motion'

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none'
  const variants = {
    primary: 'border-transparent bg-primary text-white shadow-soft hover:bg-primary-hover',
    secondary: 'border-border bg-bg-card text-text-primary hover:bg-bg-secondary',
    ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-primary/10 hover:text-primary',
    default: 'border-border bg-bg-secondary text-text-primary hover:bg-bg-card',
    danger: 'border-transparent bg-error text-white hover:bg-error/90'
  }
  const sizes = {
    xs: 'text-xs h-8 px-3 rounded-lg',
    sm: 'text-sm h-9 px-4 rounded-lg',
    md: 'text-sm h-11 px-5',
    lg: 'text-base h-12 px-6'
  }

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 0 }}
      className={`${base} ${variants[variant]} ${sizes[size] || ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
