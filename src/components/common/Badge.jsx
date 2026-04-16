import React from 'react'

export default function Badge({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'bg-bg-secondary text-text-secondary border border-border',
    primary: 'bg-primary text-white',
    secondary: 'bg-bg-secondary text-text-secondary border border-border',
    accent: 'bg-primary-accent/20 text-primary border border-primary-accent/30',
    success: 'bg-success/20 text-success border border-success/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    error: 'bg-error/20 text-error border border-error/30'
  }

  return (
    <span className={`inline-flex items-center text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-lg ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
