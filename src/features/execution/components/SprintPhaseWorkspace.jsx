import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import Badge from '../../../components/common/Badge'
import CheckDraw from '../../../components/common/CheckDraw'
import {
  BlockerPanel,
  ContributorActivityFeed,
  MilestoneTracker,
} from './DashboardBlocks'
import { getBlockers, getNextMilestone } from '../executionUtils'

export default function SprintPhaseWorkspace({
  phase,
  project,
  milestones,
  logs,
  nextAction,
  onScrollToFeed,
}) {
  const projectId = project._id || project.id
  const blockers = getBlockers(project, milestones)
  const nextMilestone = getNextMilestone(project, milestones)

  return (
    <div className="build-sprint-workspace space-y-6">
      <Card hover={false} className="build-next-step-banner border-l-4 border-l-primary">
        <p className="text-xs uppercase tracking-wide text-primary mb-1">What should I do next?</p>
        <h2 className="text-xl font-semibold text-text-primary">{nextAction.title}</h2>
        <p className="text-sm text-text-secondary mt-2">{nextAction.detail}</p>
        <p className="text-xs text-text-muted mt-2">
          Phase {phase.number}: {phase.subtitle} · maps to {phase.docSection}
        </p>
      </Card>

      <Card hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <Badge variant="primary">Phase {phase.number}</Badge>
            <h2 className="text-2xl font-bold text-text-primary mt-2">{phase.subtitle}</h2>
            <p className="text-sm text-text-secondary mt-2 max-w-2xl">{phase.goal}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{phase.progress}%</p>
            <p className="text-xs text-text-muted">phase complete</p>
          </div>
        </div>
        <div className="progress-bar mb-6">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${phase.progress}%` }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <ul className="space-y-2">
          {phase.tasks.map((task) => (
            <li
              key={task.id}
              className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
                task.complete
                  ? 'border-success/30 bg-success/5'
                  : 'border-border bg-bg-secondary/30'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {task.complete ? <CheckDraw /> : (
                  <span className="inline-flex h-5 w-5 rounded-full border-2 border-border" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${task.complete ? 'text-success' : 'text-text-primary'}`}>
                  {task.label}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{task.hint}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link to={`/project/${projectId}`}>
            <Button size="sm">Open full workspace</Button>
          </Link>
          {phase.id === 'public' && onScrollToFeed && (
            <Button variant="secondary" size="sm" onClick={onScrollToFeed}>
              Share to Feed
            </Button>
          )}
        </div>
      </Card>

      {phase.id === 'execution' && (
        <>
          <MilestoneTracker milestones={milestones} nextMilestone={nextMilestone} />
          <BlockerPanel blockers={blockers} />
          <ContributorActivityFeed logs={logs} />
        </>
      )}

      {phase.id === 'validation' && (
        <Card hover={false} className="border-secondary/20">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Validation workspace</h3>
          <p className="text-sm text-text-secondary mb-4">
            Capture surveys, interviews, and evidence in your venture validation workspace.
          </p>
          <Link to={`/project/${projectId}`}>
            <Button variant="secondary" size="sm">Open validation workspace</Button>
          </Link>
        </Card>
      )}

      {phase.id === 'incubation' && (
        <Card hover={false} className="innovation-surface">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Incubation package</h3>
          <p className="text-sm text-text-secondary">
            Execution data from each sprint phase compiles into your future incubation documents.
          </p>
        </Card>
      )}
    </div>
  )
}
