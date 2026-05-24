import React from 'react'
import {
  ReadinessProgress,
  MomentumIndicator,
} from './DashboardBlocks'
import ExecutionPostPanel from '../../feed/components/ExecutionPostPanel'
import StartupSprintPipeline from './StartupSprintPipeline'

export default function BuildRightSidebar({
  project,
  phases,
  activePhaseId,
  ventureName,
  onPost,
}) {
  const showFeedPanel = activePhaseId !== 'public'

  return (
    <aside className="build-right-rail" aria-label="Execution status">
      <div className="build-right-rail-inner space-y-4">
        {showFeedPanel && (
          <ExecutionPostPanel ventureName={ventureName} onPost={onPost} />
        )}
        <ReadinessProgress project={project} />
        <MomentumIndicator project={project} />
        <StartupSprintPipeline phases={phases} activePhaseId={activePhaseId} />
      </div>
    </aside>
  )
}
