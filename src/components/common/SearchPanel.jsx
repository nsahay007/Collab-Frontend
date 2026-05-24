import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchPanel({ open, onClose }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    inputRef.current?.focus()
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label="Search"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-24 z-[70] w-[min(92vw,32rem)] -translate-x-1/2 rounded-2xl border border-border bg-bg-elevated shadow-elevated p-4"
          >
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3">
              <svg className="h-5 w-5 text-text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                placeholder="Search ventures, builders, milestones..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted border-0 outline-none ring-0 p-0"
              />
            </div>
            <p className="mt-3 text-xs text-text-muted text-center">Global search is coming soon.</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
