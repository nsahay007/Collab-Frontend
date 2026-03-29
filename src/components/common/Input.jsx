import React from 'react'

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${className}`}
      {...props}
    />
  )
}
