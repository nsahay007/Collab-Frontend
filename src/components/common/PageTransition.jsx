import React from 'react'
import { useLocation } from 'react-router-dom'

/** Keep route changes instant — opacity animations were leaving Build blank on dark theme. */
export default function PageTransition({ children }) {
  const location = useLocation()
  return <div key={location.pathname}>{children}</div>
}
