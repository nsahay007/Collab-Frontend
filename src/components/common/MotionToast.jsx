import React, { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const MotionToastContext = createContext(null)

export function MotionToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, variant = 'primary') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, variant }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  return (
    <MotionToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-4 sm:right-6 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-elevated backdrop-blur-md ${
                toast.variant === 'success'
                  ? 'border-success/30 bg-bg-elevated text-success glow-success'
                  : toast.variant === 'innovation'
                    ? 'border-secondary/30 bg-bg-elevated text-secondary glow-violet'
                    : 'border-primary/30 bg-bg-elevated text-text-primary glow-blue'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </MotionToastContext.Provider>
  )
}

export function useMotionToast() {
  const ctx = useContext(MotionToastContext)
  if (!ctx) {
    return { showToast: () => {} }
  }
  return ctx
}
