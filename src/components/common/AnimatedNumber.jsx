import React, { useEffect, useState } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion'

export default function AnimatedNumber({ value = 0, suffix = '', duration = 600, className = '' }) {
  const reduced = useReducedMotion()
  const target = Number(value) || 0
  const [display, setDisplay] = useState(reduced ? target : 0)

  useEffect(() => {
    if (reduced) {
      setDisplay(target)
      return undefined
    }

    const start = performance.now()
    const from = display
    let frame

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setDisplay(Math.round(from + (target - from) * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduced, duration])

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  )
}
