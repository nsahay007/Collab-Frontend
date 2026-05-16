import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useAuth from '../hooks/useAuth'
import api from '../services/api'

const DEFAULT_SPRINT_DAYS = 14
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

const PHASES = ['problem', 'plan', 'build', 'mvp', 'validation', 'demo']

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.06
    }
  }
}

const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const phaseInstructions = {
  problem: 'Define the exact problem your venture is solving',
  plan: 'Describe your solution and how it will work',
  build: 'Start building the core functionality of your product',
  mvp: 'Create a working demo or prototype',
  validation: 'Get feedback from real users',
  demo: 'Prepare your final pitch or demo'
}

const submissionHints = {
  problem: 'Submit a Google Doc / Notion link explaining the problem',
  plan: 'Submit your plan (features, flow, approach)',
  build: 'Submit GitHub repo or progress link',
  mvp: 'Submit working demo or video',
  validation: 'Submit feedback screenshots or results',
  demo: 'Submit final pitch video or presentation'
}

const formatPhaseName = (phase) => {
  if (!phase || typeof phase !== 'string') return 'Problem'
  return phase.charAt(0).toUpperCase() + phase.slice(1)
}

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
    return projects.find((project) => ['planning', 'building', 'validation', 'validation_failed', 'completed', 'validated'].includes(project.status)) || projects[0]
  }

  return projects[0]
}

const getPhaseFromProject = (project) => {
  if (!project) return 'problem'

  if (PHASES.includes(project.phase)) {
    return project.phase
  }

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

  return project.teamMembers.map((member, index) => ({
    id: member?._id || member?.id || `member-${index}`,
    name: member?.name || 'Team Contributor'
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
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-xl animate-float-gentle">
        🚀
      </div>
      <h1 className="text-3xl font-bold text-text-primary mb-3">Join the 14-Day Sprint</h1>
      <p className="text-text-secondary mb-6">
        Turn your venture concept into a real venture with a startup team in 14 days.
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
      <p className="text-text-secondary">You'll be notified once selected.</p>
    </Card>
  )
}

function SprintActiveState({
  project,
  checkpoints,
  onCheckpointSubmit,
  onCheckpointUpdate,
  checkpointLoading,
  checkpointMessage,
  demoLocked,
  checkpointVisualState
}) {
  const [now, setNow] = useState(Date.now())
  const [selectedPhase, setSelectedPhase] = useState('problem')
  const [submissionLink, setSubmissionLink] = useState('')
  const [description, setDescription] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    const timerId = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timerId)
  }, [])

  const currentPhase = getPhaseFromProject(project)
  const phaseIndex = PHASES.indexOf(currentPhase)
  const checkpointsByPhase = useMemo(() => {
    const phaseMap = new Map()
    ;(checkpoints || []).forEach((checkpoint) => {
      if (checkpoint?.phase) {
        phaseMap.set(checkpoint.phase, checkpoint)
      }
    })
    return phaseMap
  }, [checkpoints])

  useEffect(() => {
    const normalizedCurrent = PHASES.includes(currentPhase) ? currentPhase : 'problem'
    setSelectedPhase(normalizedCurrent)
  }, [currentPhase])

  useEffect(() => {
    if (!PHASES.includes(selectedPhase)) return
    const selectedCheckpoint = checkpointsByPhase.get(selectedPhase)

    if (selectedCheckpoint) {
      setSubmissionLink(selectedCheckpoint.submissionLink || '')
      setDescription(selectedCheckpoint.description || '')
    } else {
      setSubmissionLink('')
      setDescription('')
    }

    setLocalError('')
  }, [selectedPhase, checkpointsByPhase])

  const selectedCheckpoint = checkpointsByPhase.get(selectedPhase)
  const selectedPhaseIndex = PHASES.indexOf(selectedPhase)
  const selectedPhaseTitle = formatPhaseName(selectedPhase)
  const { endAt } = getSprintTiming(project)
  const remainingMs = endAt - now
  const remaining = formatRemaining(remainingMs)
  const isEndingSoon = remainingMs > 0 && remainingMs <= THREE_DAYS_MS
  const progress = getProgress(project, 'active')
  const teamMembers = getTeamMembers(project)
  const checkpointLabel = selectedCheckpoint
    ? `Update ${selectedPhaseTitle}`
    : `Submit ${selectedPhaseTitle}`
  const isDemoBlocked = selectedPhase === 'demo' && demoLocked
  const showSuccessMorph = checkpointVisualState === 'success'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    const trimmedLink = submissionLink.trim()
    if (!trimmedLink) {
      setLocalError('Please add a submission link before continuing.')
      return
    }

    const payload = {
      phase: selectedPhase,
      submissionLink: trimmedLink,
      description: description.trim()
    }

    if (!selectedCheckpoint && selectedPhase !== currentPhase) {
      setLocalError('You can only submit the current phase. To edit, select a phase that is already submitted.')
      return
    }

    const result = selectedCheckpoint
      ? await onCheckpointUpdate(payload)
      : await onCheckpointSubmit(payload)

    if (result?.ok && !result?.alreadyCompleted) {
      if (!selectedCheckpoint) {
        setSubmissionLink('')
        setDescription('')
      }
    }
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={STAGGER_ITEM}>
        <Card hover={false}>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Countdown</p>
            <p className={`text-3xl font-bold ${isEndingSoon ? 'text-error' : 'text-text-primary'}`}>{remaining}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Current Phase</p>
            <p className="text-2xl font-semibold capitalize text-text-primary">{currentPhase}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Venture Progress</p>
            <p className="text-2xl font-semibold text-text-primary">{progress}%</p>
          </div>
        </div>

        <div className="mt-6 h-2 w-full rounded-full bg-bg-secondary">
          <motion.div
            className="h-2 rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <p className={`mt-4 text-sm ${isEndingSoon ? 'text-error' : 'text-text-secondary'}`}>
          {isEndingSoon
            ? 'Sprint ending soon. Complete your work now.'
            : 'Complete your current phase to move forward.'}
        </p>
        </Card>
      </motion.div>

      <motion.div variants={STAGGER_ITEM}>
        <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Sprint Workflow</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          {PHASES.map((item, index) => {
            const isSubmitted = checkpointsByPhase.has(item)
            const isDone = isSubmitted && index < phaseIndex
            const isCurrent = index === phaseIndex
            const isSelected = selectedPhase === item
            const isSelectable = isSubmitted || index <= phaseIndex
            const baseClasses = `rounded-xl border px-3 py-2 text-center text-sm capitalize ${
              isCurrent
                ? 'border-primary bg-primary/10 text-primary'
                : isDone
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-border bg-bg-card text-text-muted'
            } ${isSelected ? 'ring-2 ring-primary/60' : ''} ${
              isSelectable ? 'cursor-pointer hover:border-primary/60' : 'cursor-not-allowed opacity-70'
            }`

            const phaseNode = (
              <>
                <span className="mr-1">{isSubmitted ? '✔' : isCurrent ? '→' : '○'}</span>
                {item}
              </>
            )

            if (isCurrent) {
              return (
                <motion.button
                  key={item}
                  type="button"
                  className={baseClasses}
                  disabled={!isSelectable}
                  onClick={() => isSelectable && setSelectedPhase(item)}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {phaseNode}
                </motion.button>
              )
            }

            return (
              <button
                key={item}
                type="button"
                className={baseClasses}
                disabled={!isSelectable}
                onClick={() => isSelectable && setSelectedPhase(item)}
              >
                {phaseNode}
              </button>
            )
          })}
        </div>
        </Card>
      </motion.div>

      <motion.div variants={STAGGER_ITEM}>
        <Card hover={false}>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Selected Stage: {selectedPhaseTitle}</h2>
        <p className="text-base text-text-secondary">
          {phaseInstructions[selectedPhase] || phaseInstructions.problem}
        </p>
        <p className="mt-2 text-sm text-text-muted">
          {submissionHints[selectedPhase] || submissionHints.problem}
        </p>
        </Card>
      </motion.div>

      <motion.div variants={STAGGER_ITEM}>
        <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Team Contributors</h2>

        {teamMembers.length === 0 ? (
          <p className="text-text-secondary text-sm">No team contributors added yet.</p>
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
      </motion.div>

      <motion.div variants={STAGGER_ITEM}>
        <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Checkpoint</h2>
        <p className="text-text-secondary mb-2">
          {selectedCheckpoint
            ? `This stage is already submitted. Update it if you need to refine your proof.`
            : 'Submit progress for this stage with a shareable proof link.'}
        </p>
        <p className="text-xs text-text-muted mb-4">
          Active stage: <span className="font-semibold capitalize text-text-primary">{currentPhase}</span>
        </p>

        {checkpointMessage?.text && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              checkpointMessage.type === 'error'
                ? 'border-error/30 bg-error/10 text-error'
                : checkpointMessage.type === 'info'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-success/30 bg-success/10 text-success'
            }`}
          >
            {checkpointMessage.text}
          </div>
        )}

        {localError && (
          <div className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Submission Link</label>
            <input
              type="url"
              value={submissionLink}
              onChange={(event) => setSubmissionLink(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a short note about this phase submission"
              rows={3}
              className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={checkpointLoading || !project || isDemoBlocked}
            className="w-full sm:w-auto"
            animate={showSuccessMorph ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {showSuccessMorph
              ? '✓ Submitted'
              : isDemoBlocked
              ? 'Demo Submitted'
              : checkpointLoading
                ? 'Submitting...'
                : checkpointLabel}
          </Button>
        </form>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function SprintCompletedState({ project }) {
  const certificates = project?.validation?.certificates || []
  const demoLink = project?.validation?.demoLink

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card hover={false} className="border-success/30 bg-success/10">
        <h1 className="text-3xl font-bold text-text-primary mb-2">🎉 You completed the 14-Day Sprint</h1>
        <p className="text-text-secondary mb-4">Great execution. Your proof of work is now ready to share.</p>
        {project?._id ? (
          <Link to={`/project/${project._id}/proof`}>
            <Button className="w-full sm:w-auto">View Proof of Work</Button>
          </Link>
        ) : null}
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Venture Summary</h2>

        {project ? (
          <div className="space-y-3">
            <p className="text-text-primary font-semibold">{project.title}</p>
            <p className="text-text-secondary">{project.shortPitch || project.description}</p>
            <p className="text-sm text-text-muted">Status: {project.status || 'completed'}</p>
          </div>
        ) : (
          <p className="text-text-secondary">Venture summary will appear once your sprint venture is linked.</p>
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

function ToastBanner({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          key="dashboard-toast"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-4 top-4 z-50 rounded-xl border border-success/40 bg-success/15 px-4 py-3 text-sm text-success"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, login } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [checkpoints, setCheckpoints] = useState([])

  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')

  const [checkpointLoading, setCheckpointLoading] = useState(false)
  const [checkpointMessage, setCheckpointMessage] = useState(null)
  const [checkpointVisualState, setCheckpointVisualState] = useState('idle')
  const [demoLocked, setDemoLocked] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const sprintStatus = useMemo(() => normalizeSprintStatus(profile?.sprintStatus), [profile?.sprintStatus])

  useEffect(() => {
    if (!toastMessage) return undefined
    const timeoutId = setTimeout(() => setToastMessage(''), 2600)
    return () => clearTimeout(timeoutId)
  }, [toastMessage])

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')

    try {
      const profileResponse = await api.get('/users/me')
      const profileData = profileResponse?.data || null
      setProfile(profileData)
      if (login && profileData) login(profileData)

      const status = normalizeSprintStatus(profileData?.sprintStatus)
      if (status === 'active' || status === 'completed') {
        const projectsResponse = await api.get('/users/projects?status=all&limit=20&page=1')
        const projectList = projectsResponse?.data?.projects || []
        const normalizedProjects = Array.isArray(projectList) ? projectList : []
        setProjects(normalizedProjects)

        const currentProject = getPrimaryProject(normalizedProjects, status)
        const currentPhase = getPhaseFromProject(currentProject)

        if (currentProject?._id) {
          try {
            const checkpointsResponse = await api.get(`/checkpoints/${currentProject._id}`)
            setCheckpoints(checkpointsResponse?.data?.checkpoints || [])
          } catch (checkpointError) {
            console.error('Unable to load checkpoints for dashboard:', checkpointError)
            setCheckpoints([])
          }
        } else {
          setCheckpoints([])
        }

        setDemoLocked(status === 'completed' || (currentPhase === 'demo' && String(currentProject?.status || '').toLowerCase() === 'completed'))
      } else {
        setProjects([])
        setCheckpoints([])
        setDemoLocked(false)
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
    setCheckpointMessage(null)

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

  const handleSubmitCheckpoint = async ({ phase, submissionLink, description }) => {
    const project = getPrimaryProject(projects, sprintStatus)
    if (!project?._id) return { ok: false }

    setCheckpointLoading(true)
    setCheckpointMessage(null)
    setCheckpointVisualState('loading')

    try {
      const response = await api.post('/checkpoint/submit', {
        projectId: project._id,
        phase,
        submissionLink,
        description
      })

      const data = response?.data || {}

      if (data?.alreadyCompleted) {
        setDemoLocked(true)
        setCheckpointVisualState('completed')
        setCheckpointMessage({
          type: 'info',
          text: data?.message || 'Demo already submitted. Your sprint is complete.'
        })
        setToastMessage('Demo already submitted. Your sprint is complete.')
        await loadDashboardData()
        return { ok: true, alreadyCompleted: true, sprintCompleted: true }
      }

      if (data?.sprintCompleted) {
        setDemoLocked(true)
        setCheckpointVisualState('completed')
        setCheckpointMessage({
          type: 'success',
          text: data?.message || 'Sprint completed successfully.'
        })
        setToastMessage('🎉 Sprint Completed Successfully!')
        await loadDashboardData()
        setTimeout(() => {
          navigate(`/project/${project._id}/proof`)
        }, 600)
        return { ok: true, sprintCompleted: true }
      }

      setCheckpointMessage({
        type: 'success',
        text: data?.message || 'Checkpoint submitted successfully.'
      })
      setCheckpointVisualState('success')
      setTimeout(() => setCheckpointVisualState('idle'), 900)
      await loadDashboardData()
      return { ok: true }
    } catch (err) {
      const message = err?.response?.data?.message || 'Could not submit checkpoint. Please retry.'
      setCheckpointMessage({ type: 'error', text: message })
      setCheckpointVisualState('idle')
      return { ok: false, error: message }
    } finally {
      setCheckpointLoading(false)
    }
  }

  const handleUpdateCheckpoint = async ({ phase, submissionLink, description }) => {
    const project = getPrimaryProject(projects, sprintStatus)
    if (!project?._id) return { ok: false }

    setCheckpointLoading(true)
    setCheckpointMessage(null)
    setCheckpointVisualState('loading')

    try {
      const response = await api.patch(`/checkpoint/${project._id}/${phase}`, {
        submissionLink,
        description
      })

      const message = response?.data?.message || `Updated ${formatPhaseName(phase)} checkpoint successfully.`
      setCheckpointMessage({ type: 'success', text: message })
      setCheckpointVisualState('success')
      setToastMessage(message)
      setTimeout(() => setCheckpointVisualState('idle'), 900)
      await loadDashboardData()
      return { ok: true, updated: true }
    } catch (err) {
      const message = err?.response?.data?.message || 'Could not update checkpoint. Please retry.'
      setCheckpointMessage({ type: 'error', text: message })
      setCheckpointVisualState('idle')
      return { ok: false, error: message }
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
    return (
      <>
        <ToastBanner message={toastMessage} />
        <SprintCompletedState project={getPrimaryProject(projects, sprintStatus)} />
      </>
    )
  }

  return (
    <>
      <ToastBanner message={toastMessage} />

      <SprintActiveState
        project={getPrimaryProject(projects, sprintStatus)}
        checkpoints={checkpoints}
        onCheckpointSubmit={handleSubmitCheckpoint}
        onCheckpointUpdate={handleUpdateCheckpoint}
        checkpointLoading={checkpointLoading}
        checkpointMessage={checkpointMessage}
        demoLocked={demoLocked}
        checkpointVisualState={checkpointVisualState}
      />
    </>
  )
}
