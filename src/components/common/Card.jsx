import React from 'react'
import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, elevated = false, ...props }) {
  const surfaceClass = elevated ? 'card-elevated' : hover ? 'card-interactive' : 'card-surface'
  const hoverProps = hover
    ? {
        whileHover: { y: -3 },
        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
      }
    : {}

  return (
    <motion.div
      {...hoverProps}
      className={`${surfaceClass} p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
