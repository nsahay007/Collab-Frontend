import React, { useEffect, useMemo, useState } from 'react'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import Badge from '../../../components/common/Badge'
import Input from '../../../components/common/Input'
import {
  LINEAR_LIFECYCLE,
  getLifecycleLabel,
  getLifecycleVariant,
  normalizeLifecycleStage
} from '../../../utils/ventureLifecycle'
import {
  MOMENTUM_LABELS,
  MOMENTUM_VARIANTS,
  formatDate
} from '../../execution/executionUtils'
import {
  applyContinuationAction,
  createContributionLog,
  createVentureMilestone,
  fetchContinuationPlan,
  fetchContributionLogs,
  fetchVentureMilestones,
  updateTeamCheckIn,
  updateVentureMilestone
} from '../ventureAPI'

const MILESTONE_STATUSES = ['pending', 'in_progress', 'completed', 'blocked']
const BLOCKER_TYPES = ['technical', 'design', 'validation', 'team']
const CHECK_IN_STATUSES = ['strong_momentum', 'facing_blockers', 'needs_team_decision', 'pivoting', 'preparing_launch']

const initialMilestoneForm = (project) => ({
  title: '',
  description: '',
  owner: '',
  lifecycleStage: normalizeLifecycleStage(project?.lifecycleStage),
  dueDate: '',
  status: 'pending',
  priority: 'medium',
  blockerType: 'technical',
  blockerDescription: ''
})

export default function VentureExecutionPanel({ project, isContributor, onProjectRefresh }) {
  const projectId = project?._id || project?.id
  const [milestones, setMilestones] = useState([])
  const [logs, setLogs] = useState([])
  const [continuation, setContinuation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [milestoneForm, setMilestoneForm] = useState(initialMilestoneForm(project))
  const [milestoneSaving, setMilestoneSaving] = useState(false)
  const [checkInForm, setCheckInForm] = useState({
    status: project?.momentumStatus || 'needs_team_decision',
    note: project?.teamCheckIn?.note || ''
  })
  const [logForm, setLogForm] = useState({ action: '', impact: '', milestoneId: '' })
  const [continuationNote, setContinuationNote] = useState('')

  const contributors = useMemo(() => {
    const owner = project?.owner ? [project.owner] : []
    return [...owner, ...(project?.teamMembers || [])].filter(Boolean)
  }, [project])

  const openBlockers = useMemo(() => milestones.flatMap((milestone) => {
    const typed = (milestone.blockerDetails || [])
      .filter((blocker) => blocker.status !== 'resolved')
      .map((blocker) => ({ ...blocker, milestoneTitle: milestone.title, milestoneId: milestone._id }))
    const simple = (milestone.blockers || []).map((blocker, index) => ({
      blockerId: `${milestone._id}-simple-${index}`,
      type: 'execution',
      description: blocker,
      status: 'open',
      milestoneTitle: milestone.title,
      milestoneId: milestone._id
    }))
    return [...typed, ...simple]
  }), [milestones])

  const loadExecutionData = async () => {
    if (!projectId || !isContributor) return
    setLoading(true)
    setError('')
    try {
      const [milestoneData, logData, continuationData] = await Promise.all([
        fetchVentureMilestones(projectId),
        fetchContributionLogs(projectId),
        fetchContinuationPlan(projectId)
      ])
      setMilestones(milestoneData?.milestones || [])
      setLogs(logData?.logs || [])
      setContinuation(continuationData || null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load execution systems.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMilestoneForm(initialMilestoneForm(project))
    setCheckInForm({
      status: project?.momentumStatus || 'needs_team_decision',
      note: project?.teamCheckIn?.note || ''
    })
  }, [projectId, project?.lifecycleStage, project?.momentumStatus, project?.teamCheckIn?.note])

  useEffect(() => {
    loadExecutionData()
  }, [projectId, isContributor])

  const handleCreateMilestone = async () => {
    if (!milestoneForm.title.trim()) return
    try {
      setMilestoneSaving(true)
      setError('')
      const blockerDetails = milestoneForm.blockerDescription.trim()
        ? [{
          type: milestoneForm.blockerType,
          description: milestoneForm.blockerDescription.trim(),
          status: 'open'
        }]
        : []
      await createVentureMilestone(projectId, {
        title: milestoneForm.title,
        description: milestoneForm.description,
        owner: milestoneForm.owner || undefined,
        lifecycleStage: milestoneForm.lifecycleStage,
        dueDate: milestoneForm.dueDate || undefined,
        status: milestoneForm.status,
        priority: milestoneForm.priority,
        blockerDetails
      })
      setMilestoneForm(initialMilestoneForm(project))
      await loadExecutionData()
      await onProjectRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create milestone.')
    } finally {
      setMilestoneSaving(false)
    }
  }

  const handleMilestoneStatus = async (milestone, status) => {
    try {
      setError('')
      await updateVentureMilestone(projectId, milestone._id, { status })
      await loadExecutionData()
      await onProjectRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update milestone.')
    }
  }

  const handleResolveBlocker = async (blocker) => {
    const milestone = milestones.find((item) => item._id === blocker.milestoneId)
    if (!milestone) return
    const blockerDetails = (milestone.blockerDetails || []).map((item) => (
      item.blockerId === blocker.blockerId
        ? { ...item, status: 'resolved', resolvedAt: new Date().toISOString() }
        : item
    ))
    try {
      await updateVentureMilestone(projectId, milestone._id, { blockerDetails })
      await loadExecutionData()
      await onProjectRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to resolve blocker.')
    }
  }

  const handleCheckIn = async () => {
    try {
      setError('')
      await updateTeamCheckIn(projectId, checkInForm)
      await loadExecutionData()
      await onProjectRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update team check-in.')
    }
  }

  const handleContributionLog = async () => {
    if (!logForm.action.trim()) return
    try {
      setError('')
      await createContributionLog(projectId, logForm)
      setLogForm({ action: '', impact: '', milestoneId: '' })
      await loadExecutionData()
      await onProjectRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to add execution log.')
    }
  }

  const handleContinuation = async (action) => {
    try {
      setError('')
      const response = await applyContinuationAction(projectId, { action, note: continuationNote })
      setContinuation(response?.continuation || null)
      setContinuationNote('')
      await loadExecutionData()
      await onProjectRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to apply continuation path.')
    }
  }

  if (!isContributor) {
    return (
      <Card hover={false}>
        <h2 className="text-xl font-bold text-text-primary mb-2">Startup Execution</h2>
        <p className="text-sm text-text-secondary">
          Startup execution tools are private to the team: milestones, blockers, check-ins, progress logs, and next steps.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Startup Execution</h2>
            <p className="text-sm text-text-secondary mt-1">
              Simple guided tools for milestones, blockers, progress history, team health, and the next startup step.
            </p>
          </div>
          <Badge variant={MOMENTUM_VARIANTS[project?.momentumStatus] || 'default'}>
            {MOMENTUM_LABELS[project?.momentumStatus] || 'Needs Team Decision'}
          </Badge>
        </div>
        {loading && <p className="mt-4 text-sm text-text-secondary">Loading execution systems...</p>}
        {error && <p className="mt-4 text-sm text-error">{error}</p>}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <MilestoneSystem
          contributors={contributors}
          form={milestoneForm}
          milestones={milestones}
          saving={milestoneSaving}
          onFormChange={setMilestoneForm}
          onCreate={handleCreateMilestone}
          onStatusChange={handleMilestoneStatus}
        />
        <BlockerSystem blockers={openBlockers} onResolve={handleResolveBlocker} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TeamCheckInSystem form={checkInForm} onFormChange={setCheckInForm} onSubmit={handleCheckIn} />
        <ContributionLogSystem
          logs={logs}
          milestones={milestones}
          form={logForm}
          onFormChange={setLogForm}
          onSubmit={handleContributionLog}
        />
      </div>

      <ContinuationEngine
        continuation={continuation}
        note={continuationNote}
        onNoteChange={setContinuationNote}
        onContinue={handleContinuation}
      />
    </div>
  )
}

function MilestoneSystem({ contributors, form, milestones, saving, onFormChange, onCreate, onStatusChange }) {
  return (
    <Card hover={false}>
      <h3 className="text-lg font-semibold text-text-primary mb-3">Milestone System</h3>
      <div className="space-y-3">
        <Input
          value={form.title}
          onChange={(event) => onFormChange((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="Milestone title"
        />
        <textarea
          rows={3}
          value={form.description}
          onChange={(event) => onFormChange((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="What outcome should this milestone produce?"
          className="w-full resize-none px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={form.owner} onChange={(event) => onFormChange((prev) => ({ ...prev, owner: event.target.value }))} className="rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary">
            <option value="">Unassigned owner</option>
            {contributors.map((contributor) => (
              <option key={contributor._id || contributor.id} value={contributor._id || contributor.id}>
                {contributor.name || contributor.email || 'Team Member'}
              </option>
            ))}
          </select>
          <select value={form.lifecycleStage} onChange={(event) => onFormChange((prev) => ({ ...prev, lifecycleStage: event.target.value }))} className="rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary">
            {LINEAR_LIFECYCLE.map((stage) => (
              <option key={stage} value={stage}>{getLifecycleLabel(stage)}</option>
            ))}
          </select>
          <input type="date" value={form.dueDate} onChange={(event) => onFormChange((prev) => ({ ...prev, dueDate: event.target.value }))} className="rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary" />
          <select value={form.priority} onChange={(event) => onFormChange((prev) => ({ ...prev, priority: event.target.value }))} className="rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary">
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={form.blockerType} onChange={(event) => onFormChange((prev) => ({ ...prev, blockerType: event.target.value }))} className="rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary">
            {BLOCKER_TYPES.map((type) => <option key={type} value={type}>{type} blocker</option>)}
          </select>
          <Input
            value={form.blockerDescription}
            onChange={(event) => onFormChange((prev) => ({ ...prev, blockerDescription: event.target.value }))}
            placeholder="Optional blocker to report"
          />
        </div>
        <Button size="sm" onClick={onCreate} disabled={saving || !form.title.trim()}>
          {saving ? 'Creating...' : 'Create Milestone'}
        </Button>
      </div>

      <div className="mt-5 space-y-3 max-h-96 overflow-y-auto pr-1">
        {milestones.length > 0 ? milestones.map((milestone) => (
          <div key={milestone._id} className="rounded-xl border border-border bg-bg-secondary/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-semibold text-text-primary">{milestone.title}</h4>
              <Badge variant={getLifecycleVariant(milestone.lifecycleStage)}>
                {getLifecycleLabel(milestone.lifecycleStage)}
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {milestone.owner?.name || 'Unassigned'} · {formatDate(milestone.dueDate)} · {milestone.priority} priority
            </p>
            {milestone.description && <p className="text-sm text-text-secondary mt-2">{milestone.description}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {MILESTONE_STATUSES.map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={milestone.status === status ? 'primary' : 'secondary'}
                  size="xs"
                  onClick={() => onStatusChange(milestone, status)}
                >
                  {status.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>
        )) : (
          <p className="text-sm text-text-secondary">No milestones yet. Create the first execution milestone above.</p>
        )}
      </div>
    </Card>
  )
}

function BlockerSystem({ blockers, onResolve }) {
  return (
    <Card hover={false}>
      <h3 className="text-lg font-semibold text-text-primary mb-3">Blocker System</h3>
      <p className="text-sm text-text-secondary mb-4">
        Track technical, design, validation, and team blockers so the startup stays clear and moving.
      </p>
      {blockers.length > 0 ? (
        <div className="space-y-3">
          {blockers.map((blocker) => (
            <div key={blocker.blockerId} className="rounded-xl border border-warning/30 bg-warning/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Badge variant="warning">{blocker.type}</Badge>
                  <p className="text-sm font-medium text-warning mt-2">{blocker.description}</p>
                  <p className="text-xs text-text-muted mt-1">{blocker.milestoneTitle}</p>
                </div>
                {blocker.type !== 'execution' && (
                  <Button size="xs" variant="secondary" onClick={() => onResolve(blocker)}>
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">No active blockers. Keep the operating rhythm clear.</p>
      )}
    </Card>
  )
}

function TeamCheckInSystem({ form, onFormChange, onSubmit }) {
  return (
    <Card hover={false}>
      <h3 className="text-lg font-semibold text-text-primary mb-3">Team Check-In</h3>
      <div className="space-y-3">
        <select value={form.status} onChange={(event) => onFormChange((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary">
          {CHECK_IN_STATUSES.map((status) => (
            <option key={status} value={status}>{MOMENTUM_LABELS[status]}</option>
          ))}
        </select>
        <textarea
          rows={4}
          value={form.note}
          onChange={(event) => onFormChange((prev) => ({ ...prev, note: event.target.value }))}
          placeholder="What is happening? What is blocked? What needs attention?"
          className="w-full resize-none px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary"
        />
        <Button size="sm" onClick={onSubmit}>Update Momentum</Button>
      </div>
    </Card>
  )
}

function ContributionLogSystem({ logs, milestones, form, onFormChange, onSubmit }) {
  return (
    <Card hover={false}>
      <h3 className="text-lg font-semibold text-text-primary mb-3">Contribution Logs</h3>
      <div className="space-y-3">
        <select value={form.milestoneId} onChange={(event) => onFormChange((prev) => ({ ...prev, milestoneId: event.target.value }))} className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary">
          <option value="">General startup progress</option>
          {milestones.map((milestone) => (
            <option key={milestone._id} value={milestone._id}>{milestone.title}</option>
          ))}
        </select>
        <Input value={form.action} onChange={(event) => onFormChange((prev) => ({ ...prev, action: event.target.value }))} placeholder="What did you do?" />
        <textarea
          rows={3}
          value={form.impact}
          onChange={(event) => onFormChange((prev) => ({ ...prev, impact: event.target.value }))}
          placeholder="What changed for the startup?"
          className="w-full resize-none px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary"
        />
        <Button size="sm" onClick={onSubmit} disabled={!form.action.trim()}>Add Execution Log</Button>
      </div>
      <div className="mt-5 space-y-3 max-h-80 overflow-y-auto pr-1">
        {logs.length > 0 ? logs.slice(0, 10).map((log) => (
          <div key={log._id} className="rounded-xl border border-border bg-bg-secondary/40 p-3">
            <p className="text-sm font-semibold text-text-primary">{log.action}</p>
            {log.impact && <p className="text-sm text-text-secondary mt-1">{log.impact}</p>}
            <p className="text-xs text-text-muted mt-2">
              {log.contributor?.name || 'Team Member'}
              {log.milestoneId?.title ? ` · ${log.milestoneId.title}` : ''}
              {' · '}{formatDate(log.timestamp)}
            </p>
          </div>
        )) : (
          <p className="text-sm text-text-secondary">No contribution logs yet.</p>
        )}
      </div>
    </Card>
  )
}

function ContinuationEngine({ continuation, note, onNoteChange, onContinue }) {
  const paths = continuation?.paths || []
  return (
    <Card hover={false} className="border-primary/25">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Next Step Guide</h3>
          <p className="text-sm text-text-secondary mt-1">
            Choose the next guided startup step. The workspace keeps moving until the team is incubation-ready.
          </p>
        </div>
        <Badge variant="accent">{continuation?.readinessScore || 0}% readiness</Badge>
      </div>
      {continuation?.recommendations?.length > 0 && (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {continuation.recommendations.map((item) => (
            <div key={item} className="rounded-xl border border-border bg-bg-secondary/40 px-4 py-3 text-sm text-text-secondary">
              {item}
            </div>
          ))}
        </div>
      )}
      <textarea
        rows={3}
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder="Optional note for the next continuation decision"
        className="mt-4 w-full resize-none px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary"
      />
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {paths.map((path) => (
          <Button key={path.action} size="sm" variant="secondary" onClick={() => onContinue(path.action)}>
            {path.label}
          </Button>
        ))}
      </div>
    </Card>
  )
}
