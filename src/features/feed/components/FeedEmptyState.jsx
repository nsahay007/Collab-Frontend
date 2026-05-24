import React from 'react'
import { Link } from 'react-router-dom'

export default function FeedEmptyState({ tab = 'all' }) {
  const tabMessage =
    tab === 'milestone'
      ? 'No milestone updates yet.'
      : tab === 'blocker'
        ? 'No blocker discussions yet.'
        : tab === 'trending'
          ? 'Nothing trending this week yet.'
          : 'No startup updates yet.'

  return (
    <div className="feed-empty-state">
      <div className="feed-empty-icon" aria-hidden>
        <svg className="h-7 w-7 text-primary/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-text-primary mt-4">{tabMessage}</h2>
      <p className="text-sm text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
        Milestones and blockers from builders appear here when shared from the Build workspace.
      </p>
      <Link
        to="/build"
        className="inline-block mt-6 text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-150"
      >
        Go to Build to share an update →
      </Link>
    </div>
  )
}
