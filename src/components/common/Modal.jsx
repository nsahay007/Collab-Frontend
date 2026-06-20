import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ children, open, onClose, size = 'md' }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-4 sm:p-6 backdrop-blur-sm"
          style={{ backgroundColor: 'var(--overlay)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className={`my-auto max-h-[calc(100vh-2rem)] overflow-y-auto bg-bg-elevated rounded-2xl shadow-elevated border border-border p-6 w-full ${sizes[size]}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
