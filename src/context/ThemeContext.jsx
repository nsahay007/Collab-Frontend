import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    
    if (isDark) {
      root.classList.add('dark')
      root.style.setProperty('--bg-main', '#0b1220')
      root.style.setProperty('--bg-secondary', '#111b2e')
      root.style.setProperty('--bg-card', '#162237')
      root.style.setProperty('--text-primary', '#e2e8f0')
      root.style.setProperty('--text-secondary', '#94a3b8')
      root.style.setProperty('--text-muted', '#64748b')
      root.style.setProperty('--primary', '#818cf8')
      root.style.setProperty('--primary-hover', '#6366f1')
      root.style.setProperty('--primary-accent', '#a5b4fc')
      root.style.setProperty('--border', '#243248')
      root.style.setProperty('--shadow', '0 14px 32px rgba(2, 6, 23, 0.45)')
      root.style.setProperty('--success', '#22c55e')
      root.style.setProperty('--warning', '#f59e0b')
      root.style.setProperty('--error', '#f87171')
    } else {
      root.classList.remove('dark')
      root.style.setProperty('--bg-main', '#f5f7fb')
      root.style.setProperty('--bg-secondary', '#eef2ff')
      root.style.setProperty('--bg-card', '#ffffff')
      root.style.setProperty('--text-primary', '#0f172a')
      root.style.setProperty('--text-secondary', '#334155')
      root.style.setProperty('--text-muted', '#64748b')
      root.style.setProperty('--primary', '#4f46e5')
      root.style.setProperty('--primary-hover', '#4338ca')
      root.style.setProperty('--primary-accent', '#818cf8')
      root.style.setProperty('--border', '#dbe2f0')
      root.style.setProperty('--shadow', '0 10px 28px rgba(15, 23, 42, 0.08)')
      root.style.setProperty('--success', '#16a34a')
      root.style.setProperty('--warning', '#d97706')
      root.style.setProperty('--error', '#dc2626')
    }
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
