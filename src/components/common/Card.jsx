import React from 'react'
import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, ...props }) {
  const hoverProps = hover ? {
    whileHover: { y: -2 },
    transition: { type: 'spring', stiffness: 320, damping: 28 }
  } : {}

  return (
    <motion.div
      {...hoverProps}
      className={`bg-bg-card border border-border rounded-2xl shadow-card p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
