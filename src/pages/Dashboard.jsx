import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useAuth from '../hooks/useAuth'
import api from '../services/api'

const DEFAULT_SPRINT_DAYS = 14

const PHASES = ['problem', 'plan', 'build', 'mvp', 'validation', 'demo']

const normalizeSprintStatus = (value) => {
  if (typeof value !== 'string') return 'none'
  const normalized = value.trim().toLowerCase()
  if (['none', 'applied', 'active', 'completed'].includes(normalized)) return normalized
  return 'none'
}

const getPrimaryProject = (projects = [], sprintStatus = 'none') => {
  if (!Array.isArray(projects) || projects.length === 0) return null

  if (sprintStatus === 'completed') {
    return projects.find((project) => ['validated', 'completed'].includes(project.status)) || projects[0]
  }

  if (sprintStatus === 'active') {
    return projects.find((project) => ['planning', 'building', 'validation', 'validation_failed'].includes(project.status)) || projects[0]
  }

  return projects[0]
}

const getPhaseFromProject = (project) => {
  if (!project) return 'problem'
  const status = String(project.status || '').toLowerCase()

  if (status === 'planning') return 'problem'
  if (status === 'building') return 'build'
  if (status === 'validation' || status === 'validation_failed') return 'validation'
  if (status === 'validated' || status === 'completed') return 'demo'

  const startedAt = project.buildPhase?.startDate ? new Date(project.buildPhase.startDate).getTime() : Date.now()
  const elapsedDays = Math.max(0, Math.floor((Date.now() - startedAt) / (1000 * 60 * 60 * 24)))

  if (elapsedDays <= 2) return 'problem'
  if (elapsedDays <= 4) return 'plan'
  if (elapsedDays <= 9) return 'build'
  if (elapsedDays <= 11) return 'mvp'
  if (elapsedDays <= 13) return 'validation'
  return 'demo'
}

const getSprintTiming = (project) => {
  if (!project) {
    const now = Date.now()
    return {
      startAt: now,
      endAt: now + DEFAULT_SPRINT_DAYS * 24 * 60 * 60 * 1000,
      totalDays: DEFAULT_SPRINT_DAYS
    }
  }

  const startAt = project.buildPhase?.startDate ? new Date(project.buildPhase.startDate).getTime() : Date.now()
  const totalDays = Number(project.buildPhase?.totalDurationDays) || DEFAULT_SPRINT_DAYS
  const endAt = project.buildPhase?.endDate
    ? new Date(project.buildPhase.endDate).getTime()
    : startAt + totalDays * 24 * 60 * 60 * 1000

  return { startAt, endAt, totalDays }
}

const formatRemaining = (ms) => {
  if (ms <= 0) return '00d 00h 00m'

  const minutes = Math.floor(ms / (1000 * 60))
  const days = Math.floor(minutes / (60 * 24))
  const hours = Math.floor((minutes % (60 * 24)) / 60)
  const mins = minutes % 60

  return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`
}

const toPercent = (value) => Math.max(0, Math.min(100, value))

const getProgress = (project, sprintStatus) => {
  if (sprintStatus === 'completed') return 100

  if (!project) return 0

  const { startAt, endAt } = getSprintTiming(project)
  const elapsed = Date.now() - startAt
  const total = Math.max(1, endAt - startAt)

  return toPercent(Math.round((elapsed / total) * 100))
}

const getTeamMembers = (project) => {
  if (!project || !Array.isArray(project.teamMembers)) return []

  return project.teamMembers.map((member) => ({
    id: member?._id || member?.id || String(Math.random()),
    name: member?.name || 'Team Member'
  }))
}

function LoadingState() {
  return (
    <Card className="max-w-3xl mx-auto" hover={false}>
      <p className="text-text-secondary">Loading your sprint dashboard...</p>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card className="max-w-3xl mx-auto border-error/30" hover={false}>
      <h2 className="text-xl font-semibold text-text-primary mb-2">Unable to load dashboard</h2>
      <p className="text-text-secondary mb-4">{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </Card>
  )
}

function SprintNoneState({ applying, applyError, onApply }) {
  return (
    <Card className="max-w-3xl mx-auto" hover={false}>
      <h1 className="text-3xl font-bold text-text-primary mb-3">Join the 14-Day Sprint</h1>
      <p className="text-text-secondary mb-6">
        Turn your idea into a real project with a team in 14 days.
      </p>

      {applyError && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {applyError}
        </div>
      )}

      <Button onClick={onApply} disabled={applying} className="w-full sm:w-auto">
        {applying ? 'Applying...' : 'Apply for Sprint'}
      </Button>
    </Card>
  )
}

function SprintAppliedState() {
  return (
    <Card className="max-w-3xl mx-auto" hover={false}>
      <h1 className="text-3xl font-bold text-text-primary mb-3">Your application is under review</h1>
      <p className="text-text-secondary">You’ll be notified once selected.</p>
    </Card>
  )
}

function SprintActiveState({ project, onCheckpoint, checkpointLoading, checkpointMessage }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timerId = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timerId)
  }, [])

  const phase = getPhaseFromProject(project)
  const phaseIndex = PHASES.indexOf(phase)
  const { endAt } = getSprintTiming(project)
  const remaining = formatRemaining(endAt - now)
  const progress = getProgress(project, 'active')
  const teamMembers = getTeamMembers(project)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card hover={false}>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Countdown</p>
            <p className="text-3xl font-bold text-text-primary">{remaining}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Current Phase</p>
            <p className="text-2xl font-semibold capitalize text-text-primary">{phase}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Project Progress</p>
            <p className="text-2xl font-semibold text-text-primary">{progress}%</p>
          </div>
        </div>

        <div className="mt-6 h-2 w-full rounded-full bg-bg-secondary">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Sprint Workflow</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          {PHASES.map((item, index) => {
            const isDone = index < phaseIndex
            const isCurrent = index === phaseIndex

            return (
              <div
                key={item}
                className={`rounded-xl border px-3 py-2 text-center text-sm capitalize ${
                  isCurrent
                    ? 'border-primary bg-primary/10 text-primary'
                    : isDone
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-border bg-bg-card text-text-muted'
                }`}
              >
                {item}
              </div>
            )
          })}
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Team Members</h2>

        {teamMembers.length === 0 ? (
          <p className="text-text-secondary text-sm">No team members added yet.</p>
        ) : (
          <ul className="space-y-2">
            {teamMembers.map((member) => (
              <li key={member.id} className="rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary">
                {member.name}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Checkpoint</h2>
        <p className="text-text-secondary mb-4">Submit today’s progress update for your sprint.</p>

        {checkpointMessage && (
          <p className="mb-3 text-sm text-success">{checkpointMessage}</p>
        )}

        <Button onClick={onCheckpoint} disabled={checkpointLoading || !project} className="w-full sm:w-auto">
          {checkpointLoading ? 'Submitting...' : 'Submit Checkpoint'}
        </Button>
      </Card>
    </div>
  )
}

function SprintCompletedState({ project }) {
  const certificates = project?.validation?.certificates || []
  const demoLink = project?.validation?.demoLink

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card hover={false}>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Sprint completed</h1>
        <p className="text-text-secondary">Your sprint is complete. Here’s the project summary.</p>
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Project Summary</h2>

        {project ? (
          <div className="space-y-3">
            <p className="text-text-primary font-semibold">{project.title}</p>
            <p className="text-text-secondary">{project.shortPitch || project.description}</p>
            <p className="text-sm text-text-muted">Status: {project.status || 'completed'}</p>
          </div>
        ) : (
          <p className="text-text-secondary">Project summary will appear once your sprint project is linked.</p>
        )}
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Proof of Work</h2>
        <div className="space-y-3 text-sm text-text-secondary">
          <p>Validation Reviews: {project?.validation?.currentReviews ?? 0}</p>
          <p>Average Rating: {project?.validation?.averageRating ?? 0}</p>
          <p>Completed On: {project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}</p>

          {certificates.length > 0 && (
            <a
              href={certificates[0].url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-primary font-semibold hover:underline"
            >
              View certificate
            </a>
          )}
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">MVP Link</h2>

        {demoLink ? (
          <a href={demoLink} target="_blank" rel="noreferrer">
            <Button className="w-full sm:w-auto">Open MVP</Button>
          </a>
        ) : (
          <p className="text-text-secondary">No MVP link added yet.</p>
        )}
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const { user, login } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])

  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')

  const [checkpointLoading, setCheckpointLoading] = useState(false)
  const [checkpointMessage, setCheckpointMessage] = useState('')

  const sprintStatus = useMemo(() => normalizeSprintStatus(profile?.sprintStatus), [profile?.sprintStatus])

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')

    try {
      const profileResponse = await api.get('/users/me')
      const profileData = profileResponse?.data || null

      setProfile(profileData)

      const status = normalizeSprintStatus(profileData?.sprintStatus)
      if (status === 'active' || status === 'completed') {
        const projectsResponse = await api.get('/users/projects?status=all&limit=20&page=1')
        const projectList = projectsResponse?.data?.projects || []
        setProjects(Array.isArray(projectList) ? projectList : [])
      } else {
        setProjects([])
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Could not load sprint dashboard. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadDashboardData()
  }, [user?.id, user?._id])

  const handleApplyForSprint = async () => {
    setApplying(true)
    setApplyError('')
    setCheckpointMessage('')

    try {
      const response = await api.post('/sprint/apply', {})
      const nextStatus = normalizeSprintStatus(response?.data?.sprintStatus || 'applied')

      const nextUser = {
        ...(profile || {}),
        sprintStatus: nextStatus
      }

      setProfile(nextUser)
      if (login) login(nextUser)
    } catch (err) {
      const apiStatus = normalizeSprintStatus(err?.response?.data?.sprintStatus)
      if (err?.response?.status === 409 && apiStatus !== 'none') {
        const nextUser = {
          ...(profile || {}),
          sprintStatus: apiStatus
        }
        setProfile(nextUser)
        if (login) login(nextUser)
      } else {
        setApplyError(err?.response?.data?.message || 'Unable to apply for sprint right now.')
      }
    } finally {
      setApplying(false)
    }
  }

  const handleSubmitCheckpoint = async () => {
    const project = getPrimaryProject(projects, sprintStatus)
    if (!project?._id) return

    setCheckpointLoading(true)
    setCheckpointMessage('')

    try {
      await api.post(`/projects/${project._id}/update-activity`, {})
      setCheckpointMessage('Checkpoint submitted successfully.')
      await loadDashboardData()
    } catch (err) {
      setCheckpointMessage(err?.response?.data?.message || 'Could not submit checkpoint. Please retry.')
    } finally {
      setCheckpointLoading(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />
  }

  if (sprintStatus === 'none') {
    return <SprintNoneState applying={applying} applyError={applyError} onApply={handleApplyForSprint} />
  }

  if (sprintStatus === 'applied') {
    return <SprintAppliedState />
  }

  if (sprintStatus === 'completed') {
    return <SprintCompletedState project={getPrimaryProject(projects, sprintStatus)} />
  }

  return (
    <SprintActiveState
      project={getPrimaryProject(projects, sprintStatus)}
      onCheckpoint={handleSubmitCheckpoint}
      checkpointLoading={checkpointLoading}
      checkpointMessage={checkpointMessage}
    />
  )
}
