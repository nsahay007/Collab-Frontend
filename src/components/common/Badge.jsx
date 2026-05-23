import React from 'react'

export default function Badge({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'bg-bg-secondary text-text-secondary border border-border',
    primary: 'bg-primary/15 text-primary border border-primary/25',
    secondary: 'bg-bg-secondary text-text-secondary border border-border',
    accent: 'bg-secondary/15 text-secondary border border-secondary/25',
    innovation: 'bg-secondary/15 text-secondary border border-secondary/25',
    success: 'bg-success/12 text-success border border-success/25',
    warning: 'bg-warning/12 text-warning border border-warning/25',
    error: 'bg-error/12 text-error border border-error/25',
  }

  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-lg ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  )
}
