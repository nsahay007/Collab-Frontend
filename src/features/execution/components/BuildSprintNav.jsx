import React from 'react'
import { motion } from 'framer-motion'
import CheckDraw from '../../../components/common/CheckDraw'

export default function BuildSprintNav({ phases, activePhaseId, onSelectPhase, overallProgress }) {
  return (
    <nav className="build-sprint-nav" aria-label="Execution sprint pipeline">
      <div className="build-sprint-nav-header">
        <p className="text-xs uppercase tracking-wide text-text-muted">Execution Sprint</p>
        <p className="text-sm font-semibold text-text-primary mt-1">Pre-incubation pipeline</p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
            <span>Overall sprint</span>
            <span className="text-text-secondary font-medium">{overallProgress}%</span>
          </div>
          <div className="progress-bar h-1.5">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>

      <ol className="build-sprint-nav-list">
        {phases.map((phase) => {
          const active = phase.id === activePhaseId
          const complete = phase.progress >= 100
          const locked = !phase.unlocked

          return (
            <li key={phase.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onSelectPhase(phase.id)}
                className={`build-sprint-nav-item w-full text-left ${
                  active ? 'build-sprint-nav-item--active' : ''
                } ${locked ? 'build-sprint-nav-item--locked' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`build-sprint-nav-step shrink-0 ${
                      complete ? 'build-sprint-nav-step--done' : active ? 'build-sprint-nav-step--active' : ''
                    }`}
                  >
                    {complete ? <CheckDraw className="h-3.5 w-3.5 text-success" /> : phase.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-primary leading-tight">
                      {phase.title}
                    </span>
                    <span className="block text-xs text-text-muted mt-0.5 line-clamp-2">
                      {phase.subtitle}
                    </span>
                    <span className="block text-[11px] text-text-muted mt-2">
                      {locked ? 'Locked' : `${phase.progress}%`}
                    </span>
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
