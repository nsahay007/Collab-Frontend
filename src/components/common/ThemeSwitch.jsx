import React from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeSwitch() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-col">
        <label htmlFor="dark-mode-toggle" className="text-text-primary font-medium text-sm leading-none">
          Dark Mode
        </label>
        <span className="text-text-secondary text-xs mt-1">
          {isDark ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      
      <button
        id="dark-mode-toggle"
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-bg-card"
        style={{
          backgroundColor: isDark ? 'var(--primary)' : 'color-mix(in srgb, var(--border) 85%, white)'
        }}
      >
        <span className="sr-only">Toggle dark mode</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
          style={{
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
        >
          {!isDark ? (
            <svg 
              className="h-3 w-3 text-gray-600" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              style={{ marginTop: '2px', marginLeft: '2px' }}
            >
              <path 
                fillRule="evenodd" 
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                clipRule="evenodd" 
              />
            </svg>
          ) : (
            <svg 
              className="h-3 w-3 text-gray-800" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              style={{ marginTop: '2px', marginLeft: '2px' }}
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  )
}
