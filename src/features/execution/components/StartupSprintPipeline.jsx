import React from 'react'
import { motion } from 'framer-motion'
import Card from '../../../components/common/Card'

export default function StartupSprintPipeline({ phases, activePhaseId }) {
  return (
    <Card hover={false}>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Startup Pipeline</h2>
      <p className="text-xs text-text-muted mb-4">Sprint phases toward incubation readiness</p>
      <div className="space-y-2">
        {phases.map((phase) => {
          const active = phase.id === activePhaseId
          const complete = phase.progress >= 100
          const locked = !phase.unlocked
          return (
            <div
              key={phase.id}
              className={`rounded-xl border px-3 py-2.5 text-xs transition-colors ${
                locked
                  ? 'border-border bg-bg-secondary/20 text-text-muted opacity-60'
                  : active
                    ? 'border-primary bg-primary/10 text-primary'
                    : complete
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-border bg-bg-secondary/40 text-text-secondary'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">
                  {complete ? '✓' : locked ? '○' : '→'} {phase.title}
                </span>
                <span>{locked ? '—' : `${phase.progress}%`}</span>
              </div>
              {active && !locked && (
                <motion.div
                  className="mt-2 h-1 rounded-full bg-bg-secondary overflow-hidden"
                  initial={false}
                >
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${phase.progress}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
