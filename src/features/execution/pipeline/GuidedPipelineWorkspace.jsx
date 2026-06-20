import React from 'react'
import PhaseFoundation from './phases/PhaseFoundation'
import PhasePurpose from './phases/PhasePurpose'
import PhaseReadiness from './phases/PhaseReadiness'
import PhaseValidation from './phases/PhaseValidation'
import PhaseMvp from './phases/PhaseMvp'
import PhaseIncubation from './phases/PhaseIncubation'

export default function GuidedPipelineWorkspace({
  phase,
  project,
  phases,
  milestones,
  logs,
  onSaved,
  onMilestonesRefresh,
  onPost,
  showToast,
}) {
  if (!phase || !project) return null

  const common = { phase, project, onSaved, showToast }

  switch (phase.id) {
    case 'foundation':
      return <PhaseFoundation {...common} />
    case 'purpose':
      return <PhasePurpose {...common} />
    case 'readiness':
      return <PhaseReadiness {...common} />
    case 'validation':
      return <PhaseValidation {...common} />
    case 'execution':
      return (
        <PhaseMvp
          {...common}
          milestones={milestones}
          logs={logs}
          onMilestonesRefresh={onMilestonesRefresh}
          onPost={onPost}
        />
      )
    case 'incubation':
      return <PhaseIncubation {...common} phases={phases} />
    default:
      return <PhaseFoundation {...common} />
  }
}
