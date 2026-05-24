import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { DashboardSkeleton } from '../../components/common/Skeleton'
import useAuth from '../../hooks/useAuth'
import api from '../../services/api'
import BuildSprintNav from './components/BuildSprintNav'
import GuidedPipelineWorkspace from './pipeline/GuidedPipelineWorkspace'
import BuildRightSidebar from './components/BuildRightSidebar'
import WorkspaceAdmin from './components/WorkspaceAdmin'
import { buildSprintState } from './sprintPipeline'
import { getPrimaryProject } from './executionUtils'
import { formatMomentum, MOMENTUM_VARIANTS } from './executionUtils'
import { getLifecycleLabel, getLifecycleVariant, normalizeLifecycleStage } from '../../utils/ventureLifecycle'
import ExecutionPostPanel from '../feed/components/ExecutionPostPanel'
import { useFeedPosts } from '../feed/useFeedPosts'
import { useMotionToast } from '../../components/common/MotionToast'
import { fetchProject } from '../projects/projectAPI'

function ErrorState({ message, onRetry }) {
  return (
    <Card className="max-w-3xl mx-auto border-error/30" hover={false}>
      <h2 className="text-xl font-semibold text-text-primary mb-2">Unable to load workspace</h2>
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
        Create a workspace to run the guided pipeline from foundation through incubation readiness.
      </p>
      <Link to="/create">
        <Button className="w-full sm:w-auto">Create Startup Workspace</Button>
      </Link>
    </Card>
  )
}

/**
 * Unified startup execution OS — used by /build and /project/:id
 * @param {string} [projectId] — load this venture; if omitted, uses the user&apos;s primary project
 * @param {'build'|'workspace'} viewMode — header copy only
 */
export default function StartupWorkspacePage({ projectId: fixedProjectId, viewMode = 'build' }) {
  const { user } = useAuth()
  const { posts, createPost } = useFeedPosts()
  const { showToast } = useMotionToast()

  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePhaseId, setActivePhaseId] = useState(null)

  const feedPostCount = useMemo(() => {
    if (!project?.title) return posts.length
    return posts.filter(
      (p) => p.venture === project.title || p.projectTitle === project.title
    ).length
  }, [posts, project?.title])

  const sprintContext = useMemo(
    () => ({ milestones, logs, feedPostCount }),
    [milestones, logs, feedPostCount]
  )

  const sprint = useMemo(
    () => (project ? buildSprintState(project, sprintContext) : null),
    [project, sprintContext]
  )

  const phases = sprint?.phases || []
  const overallProgress = sprint?.overallProgress ?? 0
  const resolvedActivePhaseId = activePhaseId || sprint?.activePhaseId || phases[0]?.id
  const activePhase = phases.find((p) => p.id === resolvedActivePhaseId) || phases[0]

  const loadWorkspace = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const profileResponse = await api.get('/users/me')
      setProfile(profileResponse?.data || null)

      let targetId = fixedProjectId
      let listProject = null

      if (!targetId) {
        const projectsResponse = await api.get('/users/projects?lifecycleStage=all&limit=30&page=1')
        const projectList = Array.isArray(projectsResponse?.data?.projects) ? projectsResponse.data.projects : []
        setProjects(projectList)
        listProject = getPrimaryProject(projectList)
        targetId = listProject?._id || listProject?.id
      }

      if (!targetId) {
        setProject(null)
        setMilestones([])
        setLogs([])
        return
      }

      const [detail, milestonesResponse, logsResponse] = await Promise.allSettled([
        fetchProject(targetId),
        api.get(`/projects/${targetId}/milestones`),
        api.get(`/projects/${targetId}/contribution-logs`),
      ])

      const loaded = detail.status === 'fulfilled' ? detail.value : null
      const resolved =
        loaded && (loaded._id || loaded.id) ? loaded : listProject

      if (!resolved?._id && !resolved?.id) {
        const fetchMessage =
          detail.status === 'rejected'
            ? detail.reason?.response?.data?.message
            : null
        setError(fetchMessage || 'Startup workspace not found')
        setProject(null)
        return
      }

      setProject(resolved)
      setMilestones(
        milestonesResponse.status === 'fulfilled' ? milestonesResponse.value?.data?.milestones || [] : []
      )
      setLogs(logsResponse.status === 'fulfilled' ? logsResponse.value?.data?.logs || [] : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load your execution sprint.')
    } finally {
      setLoading(false)
    }
  }, [fixedProjectId])

  useEffect(() => {
    loadWorkspace()
  }, [loadWorkspace])

  useEffect(() => {
    if (sprint?.activePhaseId && !activePhaseId) {
      setActivePhaseId(sprint.activePhaseId)
    }
  }, [sprint?.activePhaseId, activePhaseId])

  const handlePublishToFeed = async ({ type, content, media }) => {
    createPost({
      type,
      content,
      media,
      user,
      projectTitle: project?.title,
    })
    showToast(
      type === 'milestone' ? 'Milestone published to ecosystem feed' : 'Blocker shared with builders',
      type === 'milestone' ? 'success' : 'primary'
    )
  }

  if (loading) return <DashboardSkeleton />
  if (error) return <ErrorState message={error} onRetry={loadWorkspace} />
  if (!project || !activePhase) return <EmptyVentureState />

  const lifecycleStage = normalizeLifecycleStage(
    project.lifecycleStage || project.status || project.phase
  )
  const projectId = project._id || project.id
  const isBuildView = viewMode === 'build'

  return (
    <div className="build-page max-w-[1440px] mx-auto">
      <header className="build-page-header mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">
              {isBuildView ? 'Startup execution OS' : 'Full startup workspace'}
            </p>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">{project.title}</h1>
            <p className="text-text-secondary mt-2 max-w-2xl">
              {profile?.name ? `${profile.name} · ` : ''}
              Guided sprint — answer each question in its section, upload proof where required.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={getLifecycleVariant(lifecycleStage)}>{getLifecycleLabel(lifecycleStage)}</Badge>
              <Badge variant={MOMENTUM_VARIANTS[project.momentumStatus] || 'default'}>
                {formatMomentum(project.momentumStatus)}
              </Badge>
              <Badge variant="default">{overallProgress}% sprint complete</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {isBuildView ? (
              <>
                <Link to="/create">
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                    New workspace
                  </Button>
                </Link>
                <Link to={`/project/${projectId}`}>
                  <Button size="sm" className="w-full sm:w-auto">Open this workspace</Button>
                </Link>
              </>
            ) : (
              <Link to="/build">
                <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                  Back to Build
                </Button>
              </Link>
            )}
            <WorkspaceAdmin project={project} projectId={projectId} onRefresh={loadWorkspace} />
          </div>
        </div>
      </header>

      <div className="build-page-grid">
        <aside className="build-left-rail">
          <BuildSprintNav
            phases={phases}
            activePhaseId={resolvedActivePhaseId}
            onSelectPhase={setActivePhaseId}
            overallProgress={overallProgress}
          />
        </aside>

        <main className="build-main-rail min-w-0">
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
            project={project}
            milestones={milestones}
            logs={logs}
            onSaved={loadWorkspace}
            onMilestonesRefresh={loadWorkspace}
            onPost={handlePublishToFeed}
            showToast={showToast}
          />
        </main>

        <div className="build-right-rail-wrap hidden lg:block">
          <BuildRightSidebar
            project={project}
            phases={phases}
            activePhaseId={resolvedActivePhaseId}
            ventureName={project.title}
            onPost={handlePublishToFeed}
          />
        </div>
      </div>

      {resolvedActivePhaseId !== 'public' && (
        <div className="lg:hidden mt-8">
          <ExecutionPostPanel ventureName={project.title} onPost={handlePublishToFeed} />
        </div>
      )}
    </div>
  )
}
