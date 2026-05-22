import React, { useEffect, useState } from 'react'
import Card from '../../../components/common/Card'
import Badge from '../../../components/common/Badge'
import Button from '../../../components/common/Button'
import { fetchIncubationPacket } from '../ventureAPI'

export default function IncubationReadinessPanel({ project, isTeamMember }) {
  const projectId = project?._id || project?.id
  const [packet, setPacket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPacket = async () => {
    if (!projectId || !isTeamMember) return
    try {
      setLoading(true)
      setError('')
      const data = await fetchIncubationPacket(projectId)
      setPacket(data?.packet || null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to generate incubation packet.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPacket()
  }, [projectId, isTeamMember])

  if (!isTeamMember) {
    return (
      <Card id="workspace-readiness" hover={false}>
        <h2 className="text-xl font-bold text-text-primary mb-2">Incubation Readiness</h2>
        <p className="text-sm text-text-secondary">Only startup team members can view generated incubation materials.</p>
      </Card>
    )
  }

  const checklist = packet?.checklist || []
  const readyCount = checklist.filter((item) => item.ready).length

  return (
    <Card id="workspace-readiness" hover={false} className="border-primary/25">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary mb-2">Incubation Readiness</p>
          <h2 className="text-xl font-bold text-text-primary">Generated startup application packet</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Collab organizes the documents an incubation center expects: summary, validation, team, milestones, MVP proof, evidence, and pitch structure.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Badge variant={readyCount >= 8 ? 'success' : 'accent'}>{packet?.readinessScore || project?.readinessScore || 0}% ready</Badge>
          <Button size="sm" variant="secondary" onClick={loadPacket} disabled={loading}>
            {loading ? 'Generating...' : 'Refresh Packet'}
          </Button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {checklist.map((item) => (
          <div key={item.key} className={`rounded-xl border px-4 py-3 ${item.ready ? 'border-success/30 bg-success/10' : 'border-border bg-bg-secondary/40'}`}>
            <p className={`text-sm font-semibold ${item.ready ? 'text-success' : 'text-text-primary'}`}>{item.title}</p>
            <p className="mt-1 text-xs text-text-muted">{item.ready ? 'Ready' : 'Needs more workspace evidence'}</p>
          </div>
        ))}
      </div>

      {packet && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <PacketSection title="Startup Summary">
            <PacketLine label="Problem" value={packet.summary?.problemStatement} />
            <PacketLine label="Target users" value={packet.summary?.targetUsers} />
            <PacketLine label="Current stage" value={packet.summary?.currentStage} />
          </PacketSection>

          <PacketSection title="Readiness Signals">
            <PacketLine label="Completed milestones" value={`${packet.readinessSignals?.completedMilestones || 0}/${packet.readinessSignals?.totalMilestones || 0}`} />
            <PacketLine label="Validation evidence" value={packet.readinessSignals?.evidenceCount || 0} />
            <PacketLine label="Open blockers" value={packet.readinessSignals?.openBlockers || 0} />
          </PacketSection>

          <PacketSection title="Pitch Deck Structure">
            <ol className="space-y-2">
              {(packet.pitchDeckStructure || []).map((item, index) => (
                <li key={item} className="text-sm text-text-secondary">{index + 1}. {item}</li>
              ))}
            </ol>
          </PacketSection>

          <PacketSection title="Validation Questions">
            {(packet.validationReport?.questions || []).map((item) => (
              <PacketLine key={item.question} label={item.question} value={item.answer || 'Not answered yet'} />
            ))}
          </PacketSection>
        </div>
      )}
    </Card>
  )
}

function PacketSection({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary/40 p-4">
      <h3 className="font-semibold text-text-primary mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function PacketLine({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text-secondary">{value || 'Not added yet'}</p>
    </div>
  )
}
