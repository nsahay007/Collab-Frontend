import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useAuth from '../hooks/useAuth'
import api from '../services/api'
import {
  BlockerPanel,
  ContributorActivityFeed,
  ContinueBuildingPanel,
  MilestoneTracker,
  MomentumIndicator,
  ReadinessProgress,
  TeamCheckInPanel,
  VentureOverviewCard,
  VentureTimeline,
  buildDashboardTasks
} from '../features/execution/components/DashboardBlocks'
import {
  getBlockers,
  getNextMilestone,
  getPrimaryProject
} from '../features/execution/executionUtils'

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
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

function LoadingState() {
  return (
    <Card className="max-w-3xl mx-auto" hover={false}>
      <p className="text-text-secondary">Loading your startup operating system...</p>
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

function EmptyVentureState() {
  return (
    <Card className="max-w-3xl mx-auto" hover={false}>
      <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Startup Operating System</p>
      <h1 className="text-3xl font-bold text-text-primary mb-3">Start with a venture workspace</h1>
      <p className="text-text-secondary mb-6">
        Create or join a venture to validate assumptions, form a team, ship milestones, and move toward incubation readiness.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/create">
          <Button className="w-full sm:w-auto">Create Venture</Button>
        </Link>
        <Link to="/discover">
          <Button variant="secondary" className="w-full sm:w-auto">Discover Ventures</Button>
        </Link>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [milestones, setMilestones] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const primaryProject = useMemo(() => getPrimaryProject(projects), [projects])
  const nextMilestone = useMemo(() => getNextMilestone(primaryProject, milestones), [primaryProject, milestones])
  const blockers = useMemo(() => getBlockers(primaryProject, milestones), [primaryProject, milestones])
  const pendingTasks = useMemo(() => buildDashboardTasks(primaryProject, milestones), [primaryProject, milestones])

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
        const [milestonesResponse, logsResponse] = await Promise.allSettled([
          api.get(`/projects/${currentProject._id}/milestones`),
          api.get(`/projects/${currentProject._id}/contribution-logs`)
        ])
        setMilestones(milestonesResponse.status === 'fulfilled' ? milestonesResponse.value?.data?.milestones || [] : [])
        setLogs(logsResponse.status === 'fulfilled' ? logsResponse.value?.data?.logs || [] : [])
      } else {
        setMilestones([])
        setLogs([])
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load your operating dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadDashboardData()
  }, [user?.id, user?._id])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={loadDashboardData} />
  if (!primaryProject) return <EmptyVentureState />

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={STAGGER_ITEM}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Startup Operating System</p>
            <h1 className="text-3xl font-bold text-text-primary">What should we build next?</h1>
            <p className="text-text-secondary mt-2">
              {profile?.name ? `${profile.name}, ` : ''}your dashboard is organized around venture momentum, not passive participation.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/discover">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto">Find Contributors</Button>
            </Link>
            <Link to="/create">
              <Button size="sm" className="w-full sm:w-auto">New Venture</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div variants={STAGGER_ITEM}>
        <VentureOverviewCard project={primaryProject} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={STAGGER_ITEM} className="lg:col-span-2 space-y-6">
          <ContinueBuildingPanel
            project={primaryProject}
            nextMilestone={nextMilestone}
            pendingTasks={pendingTasks}
          />
          <MilestoneTracker milestones={milestones} nextMilestone={nextMilestone} />
          <BlockerPanel blockers={blockers} />
          <ContributorActivityFeed logs={logs} />
        </motion.div>

        <motion.div variants={STAGGER_ITEM} className="space-y-6">
          <ReadinessProgress project={primaryProject} />
          <MomentumIndicator project={primaryProject} />
          <TeamCheckInPanel project={primaryProject} />
          <VentureTimeline project={primaryProject} />
        </motion.div>
      </div>
    </motion.div>
  )
}
