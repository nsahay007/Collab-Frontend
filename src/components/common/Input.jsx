import React from 'react'

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary ${className}`}
      {...props}
    />
  )
}
