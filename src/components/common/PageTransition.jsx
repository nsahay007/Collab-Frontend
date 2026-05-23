import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import useReducedMotion from '../../hooks/useReducedMotion'
import { pageTransition } from '../../utils/motion'

export default function PageTransition({ children }) {
  const location = useLocation()
  const reduced = useReducedMotion()

  if (reduced) {
    return <div key={location.pathname}>{children}</div>
  }

  return (
    <motion.div
      key={location.pathname}
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  )
}
