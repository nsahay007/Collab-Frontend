import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { DashboardSkeleton } from '../components/common/Skeleton'
import useAuth from '../hooks/useAuth'
import api from '../services/api'
import BuildSprintNav from '../features/execution/components/BuildSprintNav'
import GuidedPipelineWorkspace from '../features/execution/pipeline/GuidedPipelineWorkspace'
import { fetchProject } from '../features/projects/projectAPI'
import BuildRightSidebar from '../features/execution/components/BuildRightSidebar'
import { buildSprintState } from '../features/execution/sprintPipeline'
import { getPrimaryProject } from '../features/execution/executionUtils'
import {
  formatMomentum,
  MOMENTUM_VARIANTS,
} from '../features/execution/executionUtils'
import {
  getLifecycleLabel,
  getLifecycleVariant,
  normalizeLifecycleStage,
} from '../utils/ventureLifecycle'
import { staggerContainer, staggerItem } from '../utils/motion'
import ExecutionPostPanel from '../features/feed/components/ExecutionPostPanel'
import { useFeedPosts } from '../features/feed/useFeedPosts'
import { useMotionToast } from '../components/common/MotionToast'

function ErrorState({ message, onRetry }) {
  return (
    <Card className="max-w-3xl mx-auto border-error/30" hover={false}>
      <h2 className="text-xl font-semibold text-text-primary mb-2">Unable to load Build</h2>
      <p className="text-text-secondary mb-4">{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </Card>
  )
}

function EmptyVentureState() {
  return (
    <Card className="max-w-3xl mx-auto" hover={false}>
      <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Execution Sprint</p>
      <h1 className="text-3xl font-bold text-text-primary mb-3">Start your startup sprint</h1>
      <p className="text-text-secondary mb-6">
        Collab guides you from idea to incubation readiness — foundation, validation, MVP build, and public momentum.
      </p>
      <Link to="/create">
        <Button className="w-full sm:w-auto">Create Startup Workspace</Button>
      </Link>
    </Card>
  )
}

export default function Dashboard() {
  const { user, login } = useAuth()
  const { posts, createPost } = useFeedPosts()
  const { showToast } = useMotionToast()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [fullProject, setFullProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePhaseId, setActivePhaseId] = useState(null)

  const primaryProject = useMemo(
    () => fullProject || getPrimaryProject(projects),
    [fullProject, projects]
  )

  const feedPostCount = useMemo(() => {
    if (!primaryProject?.title) return posts.length
    return posts.filter(
      (p) => p.venture === primaryProject.title || p.projectTitle === primaryProject.title
    ).length
  }, [posts, primaryProject?.title])

  const sprintContext = useMemo(
    () => ({ milestones, logs, feedPostCount }),
    [milestones, logs, feedPostCount]
  )

  const sprint = useMemo(
    () => (primaryProject ? buildSprintState(primaryProject, sprintContext) : null),
    [primaryProject, sprintContext]
  )

  const phases = sprint?.phases || []
  const overallProgress = sprint?.overallProgress ?? 0

  const resolvedActivePhaseId = activePhaseId || sprint?.activePhaseId || phases[0]?.id
  const activePhase = phases.find((p) => p.id === resolvedActivePhaseId) || phases[0]

  const handleRefreshProject = () => loadDashboardData()

  const handlePublishToFeed = async ({ type, content, media }) => {
    createPost({
      type,
      content,
      media,
      user,
      projectTitle: primaryProject?.title,
    })
    showToast(
      type === 'milestone' ? 'Milestone published to ecosystem feed' : 'Blocker shared with builders',
      type === 'milestone' ? 'success' : 'primary'
    )
  }

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')

    try {
      const profileResponse = await api.get('/users/me')
      const profileData = profileResponse?.data || null
      setProfile(profileData)
      if (login && profileData) login(profileData)

      const projectsResponse = await api.get('/users/projects?lifecycleStage=all&limit=30&page=1')
      const projectList = Array.isArray(projectsResponse?.data?.projects) ? projectsResponse.data.projects : []
      setProjects(projectList)

      const currentProject = getPrimaryProject(projectList)
      if (currentProject?._id) {
        const projectId = currentProject._id
        const [detail, milestonesResponse, logsResponse] = await Promise.allSettled([
          fetchProject(projectId),
          api.get(`/projects/${projectId}/milestones`),
          api.get(`/projects/${projectId}/contribution-logs`),
        ])
        setFullProject(detail.status === 'fulfilled' ? detail.value : currentProject)
        setMilestones(
          milestonesResponse.status === 'fulfilled' ? milestonesResponse.value?.data?.milestones || [] : []
        )
        setLogs(logsResponse.status === 'fulfilled' ? logsResponse.value?.data?.logs || [] : [])
      } else {
        setFullProject(null)
        setMilestones([])
        setLogs([])
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load your execution sprint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadDashboardData()
  }, [user?.id, user?._id])

  useEffect(() => {
    if (sprint?.activePhaseId && !activePhaseId) {
      setActivePhaseId(sprint.activePhaseId)
    }
  }, [sprint?.activePhaseId, activePhaseId])

  if (loading) return <DashboardSkeleton />
  if (error) return <ErrorState message={error} onRetry={loadDashboardData} />
  if (!primaryProject || !activePhase) return <EmptyVentureState />

  const lifecycleStage = normalizeLifecycleStage(
    primaryProject.lifecycleStage || primaryProject.status || primaryProject.phase
  )

  return (
    <motion.div
      className="build-page max-w-[1440px] mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={staggerItem} className="build-page-header mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Startup execution OS</p>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">{primaryProject.title}</h1>
            <p className="text-text-secondary mt-2 max-w-2xl">
              {profile?.name ? `${profile.name} · ` : ''}
              Guided sprint from idea → validation → MVP → incubation readiness.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={getLifecycleVariant(lifecycleStage)}>{getLifecycleLabel(lifecycleStage)}</Badge>
              <Badge variant={MOMENTUM_VARIANTS[primaryProject.momentumStatus] || 'default'}>
                {formatMomentum(primaryProject.momentumStatus)}
              </Badge>
              <Badge variant="default">{overallProgress}% sprint complete</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/create">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                New workspace
              </Button>
            </Link>
            <Link to={`/project/${primaryProject._id || primaryProject.id}`}>
              <Button size="sm" className="w-full sm:w-auto">Full workspace</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="build-page-grid">
        <motion.aside variants={staggerItem} className="build-left-rail">
          <BuildSprintNav
            phases={phases}
            activePhaseId={resolvedActivePhaseId}
            onSelectPhase={setActivePhaseId}
            overallProgress={overallProgress}
          />
        </motion.aside>

        <motion.main variants={staggerItem} className="build-main-rail min-w-0">
          <div className="lg:hidden build-sprint-nav-mobile mb-4" role="tablist" aria-label="Sprint phases">
            {phases.map((phase) => (
              <button
                key={phase.id}
                type="button"
                role="tab"
                aria-selected={phase.id === resolvedActivePhaseId}
                disabled={!phase.unlocked}
                onClick={() => setActivePhaseId(phase.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                  phase.id === resolvedActivePhaseId
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-elevated text-text-secondary border-border'
                }`}
              >
                {phase.number}. {phase.title}
              </button>
            ))}
          </div>
          <GuidedPipelineWorkspace
            phase={activePhase}
            phases={phases}
            project={primaryProject}
            milestones={milestones}
            logs={logs}
            onSaved={handleRefreshProject}
            onMilestonesRefresh={handleRefreshProject}
            onPost={handlePublishToFeed}
            showToast={showToast}
          />
        </motion.main>

        <motion.div
          variants={staggerItem}
          className="build-right-rail-wrap hidden lg:block"
        >
          <BuildRightSidebar
            project={primaryProject}
            phases={phases}
            activePhaseId={resolvedActivePhaseId}
            ventureName={primaryProject.title}
            onPost={handlePublishToFeed}
          />
        </motion.div>
      </div>

      {resolvedActivePhaseId !== 'public' && (
        <div className="lg:hidden mt-8">
          <ExecutionPostPanel ventureName={primaryProject.title} onPost={handlePublishToFeed} />
        </div>
      )}
    </motion.div>
  )
}
