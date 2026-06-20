import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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
import { buildSprintState, SPRINT_PHASES } from './sprintPipeline'
import { formatMomentum, MOMENTUM_VARIANTS } from './executionUtils'
import { getLifecycleLabel, getLifecycleVariant, normalizeLifecycleStage } from '../../utils/ventureLifecycle'
import ExecutionPostPanel from '../feed/components/ExecutionPostPanel'
import { useFeedPosts } from '../feed/useFeedPosts'
import { useMotionToast } from '../../components/common/MotionToast'
import { fetchProject } from '../projects/projectAPI'
import { ActivityPulse, ContextCluster, InsightPanel, NarrativeSection, VentureNode } from '../../components/ecosystem/EcosystemPrimitives'

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

function isEditingField() {
  const el = typeof document !== 'undefined' ? document.activeElement : null
  if (!el) return false
  const tag = el.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable
}

function BuildHubView({ profile, projects = [] }) {
  const active = projects.filter((item) => normalizeLifecycleStage(item.lifecycleStage || item.status || item.phase) !== 'incubation_ready')
  const completed = projects.filter((item) => normalizeLifecycleStage(item.lifecycleStage || item.status || item.phase) === 'incubation_ready')
  if (!projects.length) {
    return <EmptyVentureState />
  }

  return (
    <div className="ecosystem-shell -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:-my-8 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <NarrativeSection
          eyebrow="Universe"
          title={profile?.name ? `${profile.name}'s startup universe` : 'Your startup universe'}
          action={<Link to="/create"><Button>New venture</Button></Link>}
        >
          A living overview of your ventures, signals, teams, and startup momentum. Select a venture only when you are ready to enter its command center.
        </NarrativeSection>

        <div className="grid gap-4 md:grid-cols-3">
          <InsightPanel label="Venture galaxies" value={projects.length} detail="Total startup workspaces" />
          <InsightPanel label="Momentum active" value={active.length} detail="Ventures still building" tone="green" />
          <InsightPanel label="Incubation ready" value={completed.length} detail="Final packages prepared" tone="gold" />
        </div>

        <div className="grid gap-5">
          <ContextCluster title="Venture galaxy" subtitle="Open a venture to continue execution.">
            <div className="grid gap-3 md:grid-cols-2">
              {active.map((project) => {
                const id = project._id || project.id
                return (
                  <Link key={id} to={`/project/${id}`}>
                    <VentureNode title={project.title} stage={getLifecycleLabel(project.lifecycleStage)} detail={project.shortPitch || project.description || 'Open venture command center'} />
                  </Link>
                )
              })}
              {!active.length && <ActivityPulse title="No active ventures" meta="Create one">Start a new venture galaxy from your next idea.</ActivityPulse>}
            </div>
          </ContextCluster>
        </div>

        <ContextCluster title="Completed ventures" subtitle="Read-only access to final startup packages.">
          <div className="grid gap-3 md:grid-cols-2">
            {completed.map((project) => {
              const id = project._id || project.id
              return (
                <Link key={id} to={`/project/${id}/package`}>
                  <VentureNode title={project.title} stage="Incubation Ready" detail="Open final startup package" />
                </Link>
              )
            })}
            {!completed.length && <ActivityPulse title="No final packages yet" meta="Keep building">Your completed ventures will appear here.</ActivityPulse>}
          </div>
        </ContextCluster>
      </div>
    </div>
  )
}

function ProjectList({ title, projects, packageView }) {
  return (
    <Card hover={false} className="min-w-0 h-full">
      <p className="text-lg font-semibold text-text-primary mb-3">{title}</p>
      <div className="space-y-2">
        {projects.length ? projects.map((project) => {
          const id = project._id || project.id
          return (
            <Link key={id} to={packageView ? `/project/${id}/package` : `/project/${id}`} className="block rounded-xl border border-border bg-bg-secondary/40 px-4 py-3 hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{project.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{project.shortPitch || project.description || 'Open startup workspace'}</p>
                </div>
                <Badge variant={packageView ? 'success' : getLifecycleVariant(normalizeLifecycleStage(project.lifecycleStage))}>
                  {packageView ? 'Final package' : getLifecycleLabel(project.lifecycleStage)}
                </Badge>
              </div>
            </Link>
          )
        }) : (
          <p className="rounded-xl border border-dashed border-border px-3 py-2 text-sm text-text-muted">None yet</p>
        )}
      </div>
    </Card>
  )
}

function fallbackSprintState() {
  return {
    phases: SPRINT_PHASES.map((phase, index) => ({
      ...phase,
      progress: 0,
      unlocked: index === 0,
    })),
    activePhaseId: 'foundation',
    overallProgress: 0,
  }
}

/**
 * Unified startup execution OS — used by /build and /project/:id
 */
export default function StartupWorkspacePage({ projectId: fixedProjectId, viewMode = 'build' }) {
  const { user } = useAuth()
  const { createPost } = useFeedPosts()
  const { showToast } = useMotionToast()

  const [profile, setProfile] = useState(null)
  const [project, setProject] = useState(null)
  const [projectList, setProjectList] = useState([])
  const [milestones, setMilestones] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePhaseId, setActivePhaseId] = useState('foundation')

  const sprintContext = useMemo(
    () => ({ milestones, logs }),
    [milestones, logs]
  )

  const sprint = useMemo(() => {
    if (!project) return null
    try {
      return buildSprintState(project, sprintContext)
    } catch (err) {
      console.error('buildSprintState failed:', err)
      return fallbackSprintState()
    }
  }, [project, sprintContext])

  const phases = sprint?.phases?.length ? sprint.phases : fallbackSprintState().phases
  const overallProgress = sprint?.overallProgress ?? 0
  const resolvedActivePhaseId = activePhaseId || sprint?.activePhaseId || phases[0]?.id
  const activePhase = phases.find((p) => p.id === resolvedActivePhaseId) || phases[0]
  const isBuildView = viewMode === 'build'

  const loadWorkspace = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
      setError('')
    }

    try {
      setProfile(user || null)

      let targetId = fixedProjectId

      if (!targetId) {
        const projectsResponse = await api.get('/users/projects?lifecycleStage=all&limit=30&page=1')
        const projectList = Array.isArray(projectsResponse?.data?.projects) ? projectsResponse.data.projects : []
        setProjectList(projectList)
        setProject(null)
        setMilestones([])
        setLogs([])
        return
      }

      if (!targetId) {
        setProject(null)
        setMilestones([])
        setLogs([])
        return
      }

      const loaded = await fetchProject(targetId)
      const resolved = loaded && (loaded._id || loaded.id) ? loaded : null

      if (!resolved?._id && !resolved?.id) {
        if (!silent) setError('Startup workspace not found')
        setProject(null)
        return
      }

      setProject(resolved)
      const [milestonesResponse, logsResponse] = await Promise.allSettled([
        api.get(`/projects/${targetId}/milestones`),
        api.get(`/projects/${targetId}/contribution-logs`),
      ])
      setMilestones(
        milestonesResponse.status === 'fulfilled' ? milestonesResponse.value?.data?.milestones || [] : []
      )
      setLogs(logsResponse.status === 'fulfilled' ? logsResponse.value?.data?.logs || [] : [])
    } catch (err) {
      if (!silent) setError(err?.response?.data?.message || 'Could not load your execution sprint.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [fixedProjectId, user])

  useEffect(() => {
    loadWorkspace()
  }, [loadWorkspace])

  useEffect(() => {
    if (!fixedProjectId) return undefined
    const interval = setInterval(() => {
      if (isEditingField()) return
      loadWorkspace({ silent: true })
    }, 30000)
    return () => clearInterval(interval)
  }, [fixedProjectId, loadWorkspace])

  useEffect(() => {
    if (sprint?.activePhaseId) {
      setActivePhaseId(sprint.activePhaseId)
    }
  }, [sprint?.activePhaseId])

  const handlePublishToFeed = async ({ type, content, media }) => {
    await createPost({
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

  if (loading) {
    return (
      <div className="build-page max-w-[1440px] mx-auto min-h-[40vh]">
        <DashboardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="build-page max-w-[1440px] mx-auto min-h-[40vh]">
        <ErrorState message={error} onRetry={loadWorkspace} />
      </div>
    )
  }

  if (!project || !activePhase) {
    return (
      <div className="build-page max-w-[1440px] mx-auto min-h-[40vh]">
        {isBuildView ? <BuildHubView profile={profile} projects={projectList} /> : <EmptyVentureState />}
      </div>
    )
  }

  const lifecycleStage = normalizeLifecycleStage(
    project.lifecycleStage || project.status || project.phase
  )
  const projectId = project._id || project.id

  if (lifecycleStage === 'incubation_ready' && !isBuildView) {
    return <Navigate to={`/project/${projectId}/package`} replace />
  }

  return (
    <div className="build-page max-w-[1440px] mx-auto pb-10">
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
            milestones={milestones}
          />
        </div>
      </div>

      <div className="lg:hidden mt-8">
        <ExecutionPostPanel ventureName={project.title} onPost={handlePublishToFeed} />
      </div>
    </div>
  )
}
