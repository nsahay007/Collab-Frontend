import React from 'react'
import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, ...props }) {
  const hoverProps = hover ? {
    whileHover: { y: -5 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
  } : {}

  return (
    <motion.div
      {...hoverProps}
      className={`bg-bg-card border border-border rounded-xl shadow-card p-6 ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
