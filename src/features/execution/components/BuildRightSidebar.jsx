import React from 'react'
import Card from '../../../components/common/Card'
import Badge from '../../../components/common/Badge'
import ReadinessRing from '../../../components/common/ReadinessRing'
import ExecutionPostPanel from '../../feed/components/ExecutionPostPanel'
import StartupSprintPipeline from './StartupSprintPipeline'
import { getBlockers } from '../executionUtils'
import {
  getLifecycleLabel,
  getLifecycleProgress,
  getLifecycleVariant,
  normalizeLifecycleStage
} from '../../../utils/ventureLifecycle'

function IncubationReadinessPanel({ project, milestones = [] }) {
  const stage = normalizeLifecycleStage(project?.lifecycleStage || project?.status || project?.phase)
  const readiness = Number(project?.readinessScore || getLifecycleProgress(stage) || 0)
  const validationStatus = project?.validation?.validationStatus || 'pending'
  const evidenceCount = project?.validation?.workspace?.evidence?.length || 0
  const completedMilestones = milestones.filter((milestone) => milestone.status === 'completed').length
  const milestoneText = milestones.length ? `${completedMilestones}/${milestones.length} completed` : 'No milestones yet'

  return (
    <Card hover={false} className="innovation-surface">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Incubation Readiness</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-text-secondary">Project status</span>
          <Badge variant={getLifecycleVariant(stage)}>{getLifecycleLabel(stage)}</Badge>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-text-secondary">Validation progress</span>
          <span className="text-sm font-semibold text-text-primary truncate">
            {validationStatus.replace(/_/g, ' ')} · {evidenceCount} evidence
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-text-secondary">Milestone completion</span>
          <span className="text-sm font-semibold text-text-primary">{milestoneText}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
          <div className="min-w-0">
            <p className="text-sm text-text-secondary">Readiness score</p>
            <p className="text-xl font-bold text-text-primary">{Math.max(0, Math.min(100, readiness))}%</p>
          </div>
          <ReadinessRing value={readiness} size={84} />
        </div>
      </div>
    </Card>
  )
}

function BlockerPanel({ project, milestones = [] }) {
  const blockers = getBlockers(project, milestones)

  return (
    <Card hover={false} className="innovation-surface">
      <h2 className="text-lg font-semibold text-text-primary mb-3">Blockers</h2>
      {blockers.length ? (
        <div className="space-y-3">
          {blockers.map((blocker, index) => (
            <div key={`${blocker.source}-${blocker.title}-${index}`} className="rounded-xl border border-warning/25 bg-warning/10 p-3">
              <p className="text-sm font-semibold text-text-primary">{blocker.title}</p>
              <p className="mt-1 text-xs text-text-secondary">{blocker.source || blocker.type || 'Workspace blocker'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">No active blockers right now.</p>
      )}
    </Card>
  )
}

export default function BuildRightSidebar({
  project,
  phases,
  activePhaseId,
  ventureName,
  onPost,
  milestones,
}) {
  return (
    <aside className="build-right-rail" aria-label="Execution status">
      <div className="build-right-rail-inner space-y-4">
        <IncubationReadinessPanel project={project} milestones={milestones} />
        <BlockerPanel project={project} milestones={milestones} />
        <StartupSprintPipeline phases={phases} activePhaseId={activePhaseId} />
        <ExecutionPostPanel ventureName={ventureName} onPost={onPost} />
      </div>
    </aside>
  )
}
