import {
  LINEAR_LIFECYCLE,
  getLifecycleLabel,
  getLifecyclePrompt,
  normalizeLifecycleStage
} from '../../utils/ventureLifecycle'

export const MOMENTUM_LABELS = {
  strong_momentum: 'Strong Momentum',
  facing_blockers: 'Facing Blockers',
  need_contributors: 'Need Contributors',
  pivoting: 'Pivoting',
  preparing_launch: 'Preparing Launch'
}

export const MOMENTUM_VARIANTS = {
  strong_momentum: 'success',
  facing_blockers: 'warning',
  need_contributors: 'accent',
  pivoting: 'warning',
  preparing_launch: 'primary'
}

export const formatDate = (value) => {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No date'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatMomentum = (value) => MOMENTUM_LABELS[value] || 'Need Contributors'

export const getTeamMembers = (project) => {
  if (!project || !Array.isArray(project.teamMembers)) return []
  return project.teamMembers.map((member, index) => ({
    id: member?._id || member?.id || `member-${index}`,
    name: member?.name || 'Team Contributor'
  }))
}

export const getPrimaryProject = (projects = []) => {
  if (!Array.isArray(projects) || projects.length === 0) return null

  const rankStage = (project) => {
    const stage = normalizeLifecycleStage(project.lifecycleStage || project.status || project.phase)
    if (stage === 'archived') return -1
    const index = LINEAR_LIFECYCLE.indexOf(stage)
    return index >= 0 ? index : 0
  }

  return [...projects].sort((a, b) => {
    const stageDiff = rankStage(b) - rankStage(a)
    if (stageDiff !== 0) return stageDiff
    const readinessDiff = Number(b.readinessScore || 0) - Number(a.readinessScore || 0)
    if (readinessDiff !== 0) return readinessDiff
    return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
  })[0]
}

export const getBlockers = (project, milestones = []) => {
  const milestoneBlockers = milestones
    .filter((milestone) => milestone.status === 'blocked' || (milestone.blockers || []).length > 0 || (milestone.blockerDetails || []).some((blocker) => blocker.status !== 'resolved'))
    .flatMap((milestone) => {
      const typed = (milestone.blockerDetails || [])
        .filter((blocker) => blocker.status !== 'resolved')
        .map((blocker) => ({
          title: blocker.description,
          type: blocker.type || 'technical',
          source: milestone.title
        }))
      const simple = (milestone.blockers || []).map((blocker) => ({
        title: blocker,
        type: 'execution',
        source: milestone.title
      }))
      return [...typed, ...simple]
    })

  const checkInNote = project?.momentumStatus === 'facing_blockers' && project?.teamCheckIn?.note
    ? [{ title: project.teamCheckIn.note, type: 'team', source: 'Team check-in' }]
    : []

  return [...milestoneBlockers, ...checkInNote].slice(0, 6)
}

export const getNextMilestone = (project, milestones = []) => {
  const openMilestone = milestones
    .filter((milestone) => milestone.status !== 'completed')
    .sort((a, b) => {
      const priorityRank = { high: 0, medium: 1, low: 2 }
      const priorityDiff = (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1)
      if (priorityDiff !== 0) return priorityDiff
      return new Date(a.dueDate || a.createdAt || 0).getTime() - new Date(b.dueDate || b.createdAt || 0).getTime()
    })[0]

  if (openMilestone) return openMilestone
  return {
    title: getLifecyclePrompt(project?.lifecycleStage),
    lifecycleStage: normalizeLifecycleStage(project?.lifecycleStage),
    status: 'pending',
    priority: 'medium'
  }
}

export const getPendingTasks = (project, milestones = []) => {
  const validationTasks = project?.validation?.workspace?.tasks || []
  const pendingValidation = validationTasks
    .filter((task) => task.status !== 'completed')
    .map((task) => ({
      title: task.title,
      source: 'Validation',
      dueDate: task.dueDate
    }))

  const pendingMilestones = milestones
    .filter((milestone) => milestone.status !== 'completed')
    .slice(0, 5)
    .map((milestone) => ({
      title: milestone.title,
      source: getLifecycleLabel(milestone.lifecycleStage),
      dueDate: milestone.dueDate
    }))

  return [...pendingMilestones, ...pendingValidation].slice(0, 8)
}
