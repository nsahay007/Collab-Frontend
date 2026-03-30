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
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      return false
    }
    return true
  })

  useEffect(() => {
    const root = document.documentElement
    
    if (isDark) {
      root.classList.add('dark')
      // Apply dark mode CSS variables with EXACT values
      root.style.setProperty('--bg-main', '#0B0F19')
      root.style.setProperty('--bg-secondary', '#111827')
      root.style.setProperty('--bg-card', '#1F2937')
      root.style.setProperty('--text-primary', '#E5E7EB')
      root.style.setProperty('--text-secondary', '#9CA3AF')
      root.style.setProperty('--text-muted', '#6B7280')
      root.style.setProperty('--primary', '#8B85FF')
      root.style.setProperty('--primary-hover', '#A78BFA')
      root.style.setProperty('--primary-accent', '#C4B5FD')
      root.style.setProperty('--border', '#374151')
      root.style.setProperty('--shadow', '0 4px 20px rgba(0,0,0,0.4)')
      root.style.setProperty('--success', '#4ADE80')
      root.style.setProperty('--warning', '#FBBF24')
      root.style.setProperty('--error', '#F87171')
    } else {
      root.classList.remove('dark')
      // Apply light mode CSS variables
      root.style.setProperty('--bg-main', '#F8FAFC')
      root.style.setProperty('--bg-secondary', '#F1F5F9')
      root.style.setProperty('--bg-card', '#FFFFFF')
      root.style.setProperty('--text-primary', '#0F172A')
      root.style.setProperty('--text-secondary', '#475569')
      root.style.setProperty('--text-muted', '#94A3B8')
      root.style.setProperty('--primary', '#6C63FF')
      root.style.setProperty('--primary-hover', '#5A54E6')
      root.style.setProperty('--primary-accent', '#A78BFA')
      root.style.setProperty('--border', '#E2E8F0')
      root.style.setProperty('--shadow', '0 4px 20px rgba(0,0,0,0.05)')
      root.style.setProperty('--success', '#22C55E')
      root.style.setProperty('--warning', '#F59E0B')
      root.style.setProperty('--error', '#EF4444')
    }
    
    // Save preference to localStorage with key "theme"
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
