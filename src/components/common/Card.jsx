import React from 'react'
import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, ...props }) {
  const hoverProps = hover ? {
    whileHover: { y: -2, scale: 1.01 },
    transition: { duration: 0.17, ease: [0.22, 1, 0.36, 1] }
  } : {}

  return (
    <motion.div
      {...hoverProps}
      className={`surface-hover bg-bg-card border border-border rounded-2xl shadow-card p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
