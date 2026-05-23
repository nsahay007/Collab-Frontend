import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import Badge from '../../../components/common/Badge'
import {
  LINEAR_LIFECYCLE,
  getLifecycleLabel,
  getLifecycleNextAction,
  getLifecycleProgress,
  getLifecycleVariant,
  getNextLifecycleLabel,
  normalizeLifecycleStage
} from '../../../utils/ventureLifecycle'
import {
  MOMENTUM_VARIANTS,
  formatDate,
  formatMomentum,
  getPendingTasks,
  getTeamMembers
} from '../executionUtils'

export function VentureOverviewCard({ project }) {
  const lifecycleStage = normalizeLifecycleStage(project?.lifecycleStage || project?.status || project?.phase)
  const teamMembers = getTeamMembers(project)

  return (
    <Card hover={false} className="relative overflow-hidden">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Current Startup</p>
          <h1 className="text-3xl font-bold text-text-primary">{project.title}</h1>
          <p className="text-text-secondary mt-2 max-w-3xl">{project.shortPitch || project.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant={getLifecycleVariant(lifecycleStage)}>{getLifecycleLabel(lifecycleStage)}</Badge>
            <Badge variant={MOMENTUM_VARIANTS[project.momentumStatus] || 'default'}>
              {formatMomentum(project.momentumStatus)}
            </Badge>
            <Badge variant="default">{teamMembers.length}/{project.numberOfTeammates || 1} team members</Badge>
          </div>
        </div>
        <Link to={`/project/${project._id || project.id}`}>
          <Button className="w-full lg:w-auto">Open Startup Workspace</Button>
        </Link>
      </div>
    </Card>
  )
}

export function ContinueBuildingPanel({ project, nextMilestone, pendingTasks = [] }) {
  const lifecycleStage = normalizeLifecycleStage(project?.lifecycleStage || project?.status || project?.phase)
  const nextAction = getLifecycleNextAction(lifecycleStage)

  return (
    <Card hover={false} className="border-primary/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary mb-2">Next Action</p>
          <h2 className="text-2xl font-semibold text-text-primary">{nextAction}</h2>
          <p className="text-sm text-text-secondary mt-2">
            Latest milestone: {nextMilestone.title}
          </p>
        </div>
        <Link to={`/project/${project._id || project.id}`}>
          <Button size="sm" className="w-full sm:w-auto">Build Next</Button>
        </Link>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {pendingTasks.length > 0 ? pendingTasks.slice(0, 4).map((task, index) => (
          <div key={`${task.title}-${index}`} className="rounded-xl border border-border bg-bg-secondary/60 px-4 py-3">
            <p className="text-sm font-medium text-text-primary">{task.title}</p>
            <p className="text-xs text-text-muted mt-1">{task.source} {task.dueDate ? `- due ${formatDate(task.dueDate)}` : ''}</p>
          </div>
        )) : (
        <p className="text-sm text-text-secondary">No pending tasks yet. Create a milestone in the startup workspace.</p>
        )}
      </div>
    </Card>
  )
}

export function ReadinessProgress({ project }) {
  const lifecycleStage = normalizeLifecycleStage(project?.lifecycleStage || project?.status || project?.phase)
  const lifecycleProgress = getLifecycleProgress(lifecycleStage)
  const readiness = Number(project?.readinessScore || lifecycleProgress)

  return (
    <Card hover={false}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Incubation Readiness</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Current Stage" value={getLifecycleLabel(lifecycleStage)} />
        <Metric label="Next Stage" value={getNextLifecycleLabel(lifecycleStage) || 'Keep growing'} />
        <Metric label="Readiness" value={`${readiness}%`} />
      </div>
      <div className="mt-5 progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.max(0, Math.min(100, readiness))}%` }}
        />
      </div>
    </Card>
  )
}

export function MilestoneTracker({ milestones = [], nextMilestone }) {
  const completed = milestones.filter((milestone) => milestone.status === 'completed').length
  const blocked = milestones.filter((milestone) => milestone.status === 'blocked').length

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Milestone Tracker</h2>
          <p className="text-sm text-text-secondary">{completed}/{milestones.length || 0} completed · {blocked} blocked</p>
        </div>
        <Badge variant={blocked ? 'warning' : 'success'}>{blocked ? 'Needs attention' : 'Moving'}</Badge>
      </div>
      <div className="space-y-3">
        {milestones.length > 0 ? milestones.slice(0, 5).map((milestone) => (
          <div key={milestone._id || milestone.title} className="rounded-xl border border-border bg-bg-secondary/40 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-primary">{milestone.title}</p>
              <Badge variant={milestone.status === 'completed' ? 'success' : milestone.status === 'blocked' ? 'warning' : 'default'}>
                {milestone.status}
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {getLifecycleLabel(milestone.lifecycleStage)} · {milestone.owner?.name || 'Unassigned'} · {formatDate(milestone.dueDate)}
            </p>
          </div>
        )) : (
          <p className="text-sm text-text-secondary">No milestones yet. Suggested next milestone: {nextMilestone.title}</p>
        )}
      </div>
    </Card>
  )
}

export function MomentumIndicator({ project }) {
  const status = project?.momentumStatus || 'need_contributors'
  return (
    <Card hover={false}>
      <h2 className="text-lg font-semibold text-text-primary mb-3">Team Momentum</h2>
      <Badge variant={MOMENTUM_VARIANTS[status] || 'default'}>{formatMomentum(status)}</Badge>
      <p className="text-sm text-text-secondary mt-4">
        {project?.teamCheckIn?.note || 'No team check-in yet. Add one from the startup workspace to make momentum visible.'}
      </p>
      {project?.teamCheckIn?.updatedAt && (
        <p className="text-xs text-text-muted mt-3">Updated {formatDate(project.teamCheckIn.updatedAt)}</p>
      )}
    </Card>
  )
}

export function BlockerPanel({ blockers = [] }) {
  return (
    <Card hover={false}>
      <h2 className="text-lg font-semibold text-text-primary mb-3">Active Blockers</h2>
      {blockers.length > 0 ? (
        <div className="space-y-2">
          {blockers.map((blocker, index) => (
            <div key={`${blocker.title}-${index}`} className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-warning">{blocker.title}</p>
                <Badge variant="warning">{blocker.type}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-1">{blocker.source}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">No active blockers. Keep shipping and check in if anything slows the team down.</p>
      )}
    </Card>
  )
}

export function ContributorActivityFeed({ logs = [] }) {
  return (
    <Card hover={false}>
      <h2 className="text-lg font-semibold text-text-primary mb-3">Team Progress Log</h2>
      {logs.length > 0 ? (
        <div className="space-y-3">
          {logs.slice(0, 8).map((log) => (
            <div key={log._id || `${log.action}-${log.timestamp}`} className="rounded-xl border border-border bg-bg-secondary/40 px-4 py-3">
              <p className="text-sm font-semibold text-text-primary">{log.action}</p>
              {log.impact && <p className="text-sm text-text-secondary mt-1">{log.impact}</p>}
              <p className="text-xs text-text-muted mt-2">
                {log.contributor?.name || 'Team Member'} · {formatDate(log.timestamp || log.createdAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">Progress logs will appear as the team completes milestones, resolves blockers, and ships updates.</p>
      )}
    </Card>
  )
}

export function TeamCheckInPanel({ project }) {
  return (
    <Card hover={false}>
      <h2 className="text-lg font-semibold text-text-primary mb-3">Latest Team Check-In</h2>
      <p className="text-sm text-text-secondary">
        {project?.teamCheckIn?.note || 'No check-in yet. Add one to clarify whether the startup is moving, blocked, pivoting, or preparing for incubation.'}
      </p>
      <div className="mt-4">
        <Link to={`/project/${project._id || project.id}`}>
          <Button variant="secondary" size="sm">Update Check-In</Button>
        </Link>
      </div>
    </Card>
  )
}

export function VentureTimeline({ project }) {
  const lifecycleStage = normalizeLifecycleStage(project?.lifecycleStage || project?.status || project?.phase)
  const currentIndex = LINEAR_LIFECYCLE.indexOf(lifecycleStage)

  return (
    <Card hover={false}>
      <h2 className="text-lg font-semibold text-text-primary mb-3">Startup Pipeline</h2>
      <div className="space-y-2">
        {LINEAR_LIFECYCLE.map((stage) => {
          const index = LINEAR_LIFECYCLE.indexOf(stage)
          const active = stage === lifecycleStage
          const completed = currentIndex >= 0 && index < currentIndex
          return (
            <div
              key={stage}
              className={`rounded-xl border px-4 py-3 text-sm ${
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : completed
                    ? 'border-success/30 bg-success/10 text-success'
                    : 'border-border bg-bg-secondary/40 text-text-secondary'
              }`}
            >
              {completed ? 'Complete' : active ? 'Current' : 'Upcoming'}: {getLifecycleLabel(stage)}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted mb-2">{label}</p>
      <p className="text-xl font-semibold text-text-primary">{value}</p>
    </div>
  )
}

export function buildDashboardTasks(project, milestones) {
  return getPendingTasks(project, milestones)
}
