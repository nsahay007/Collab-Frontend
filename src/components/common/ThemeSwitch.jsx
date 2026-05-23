import React from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeSwitch({ compact = false }) {
  const { isDark, toggleTheme } = useTheme()

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-elevated text-text-secondary hover:text-primary hover:border-primary/25 hover:shadow-glow-blue transition-all duration-200"
      >
        {isDark ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-col">
        <label htmlFor="dark-mode-toggle" className="text-text-primary font-medium text-sm leading-none">
          Dark mode
        </label>
        <span className="text-text-muted text-xs mt-1">
          {isDark ? 'Execution cockpit' : 'Light workspace'}
        </span>
      </div>

      <button
        id="dark-mode-toggle"
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card ${
          isDark ? 'bg-primary shadow-glow-blue' : 'bg-bg-secondary border border-border'
        }`}
      >
        <span className="sr-only">Toggle dark mode</span>
        <span
          className={`inline-flex h-5 w-5 items-center justify-center transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        >
          {!isDark ? (
            <svg className="h-3 w-3 text-warning" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  )
}
