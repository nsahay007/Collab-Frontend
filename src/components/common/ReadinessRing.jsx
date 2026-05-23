import React from 'react'
import { motion } from 'framer-motion'
import useReducedMotion from '../../hooks/useReducedMotion'

const SIZE = 88
const STROKE = 6
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

export default function ReadinessRing({ value = 0, className = '' }) {
  const reduced = useReducedMotion()
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  const offset = C - (pct / 100) * C
  const strokeColor = pct >= 75 ? 'var(--success)' : pct >= 40 ? 'var(--primary)' : 'var(--warning)'

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={reduced ? { strokeDashoffset: offset } : { strokeDashoffset: C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${strokeColor}33)` }}
        />
      </svg>
      <span className="absolute text-lg font-bold text-text-primary">{pct}%</span>
    </div>
  )
}
