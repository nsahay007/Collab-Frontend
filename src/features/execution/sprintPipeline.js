import { normalizeLifecycleStage } from '../../utils/ventureLifecycle'

export const SPRINT_PHASES = [
  {
    id: 'foundation',
    number: 1,
    title: 'Foundation',
    subtitle: 'Define Your Startup',
    goal: 'Create startup clarity and identity.',
    docSection: 'Identity & Positioning',
    tasks: [
      { id: 'startup_title', label: 'Startup title', hint: 'Clear, memorable venture name' },
      { id: 'one_line_summary', label: 'One-line summary', hint: 'What you build in one sentence' },
      { id: 'tagline', label: 'Tagline', hint: 'Short phrase that captures your edge' },
      { id: 'category', label: 'Category', hint: 'Domain your startup operates in' },
      { id: 'startup_identity', label: 'Startup identity', hint: 'What makes this venture distinct' },
      { id: 'project_keywords', label: 'Project keywords', hint: 'Tags for discovery and focus' },
    ],
  },
  {
    id: 'purpose',
    number: 2,
    title: 'Purpose & Vision',
    subtitle: 'Why Does This Matter?',
    goal: 'Connect problem, audience, inspiration, and impact.',
    docSection: 'Purpose Narrative',
    tasks: [
      { id: 'founder_inspiration', label: 'Founder inspiration', hint: 'Why you are building this' },
      { id: 'problem_definition', label: 'Problem definition', hint: 'The pain you are solving' },
      { id: 'target_audience', label: 'Target audience', hint: 'Who experiences this problem' },
      { id: 'startup_vision', label: 'Startup vision', hint: 'Where this venture is headed' },
    ],
  },
  {
    id: 'readiness',
    number: 3,
    title: 'Execution Readiness',
    subtitle: 'Prepare to Build',
    goal: 'Align stage, team needs, and execution direction.',
    docSection: 'Team & Execution Setup',
    tasks: [
      { id: 'startup_stage', label: 'Startup stage', hint: 'Current lifecycle position' },
      { id: 'collaborator_requirements', label: 'Collaborator requirements', hint: 'Roles and skills needed' },
      { id: 'execution_readiness', label: 'Execution readiness setup', hint: 'Plan, team size, and scope' },
    ],
  },
  {
    id: 'validation',
    number: 4,
    title: 'Validation',
    subtitle: 'Prove The Problem Exists',
    goal: 'Test demand with real users and evidence.',
    docSection: 'Market Validation Report',
    tasks: [
      { id: 'surveys', label: 'Surveys', hint: 'Structured demand testing' },
      { id: 'interviews', label: 'Interviews', hint: 'Conversations with target users' },
      { id: 'feedback_uploads', label: 'Feedback uploads', hint: 'Artifacts from user research' },
      { id: 'user_insights', label: 'User insights', hint: 'Patterns from real feedback' },
      { id: 'validation_evidence', label: 'Validation evidence', hint: 'Proof the problem is real' },
    ],
  },
  {
    id: 'execution',
    number: 5,
    title: 'Execution & MVP',
    subtitle: 'Build The Startup',
    goal: 'Ship milestones, prototypes, and sprint work.',
    docSection: 'Build Log & MVP Record',
    tasks: [
      { id: 'roadmap', label: 'Roadmap creation', hint: 'Milestones mapped to stages' },
      { id: 'milestone_tracking', label: 'Milestone tracking', hint: 'Track and complete key deliverables' },
      { id: 'mvp_uploads', label: 'MVP uploads', hint: 'Demo assets and build proof' },
      { id: 'prototype_progress', label: 'Prototype progress', hint: 'Active build phase momentum' },
      { id: 'sprint_execution', label: 'Sprint execution', hint: 'Team contribution activity' },
      { id: 'task_management', label: 'Task management', hint: 'Open work clearly owned' },
    ],
  },
  {
    id: 'public',
    number: 6,
    title: 'Public Building',
    subtitle: 'Build With The Ecosystem',
    goal: 'Share milestones and blockers on the Feed.',
    docSection: 'Public Execution Timeline',
    tasks: [
      { id: 'milestone_post', label: 'Share a milestone', hint: 'Publish progress to Feed' },
      { id: 'blocker_post', label: 'Share a blocker', hint: 'Ask the ecosystem for help' },
      { id: 'public_update', label: 'Public startup update', hint: 'Keep builders in the loop' },
    ],
  },
  {
    id: 'incubation',
    number: 7,
    title: 'Incubation Prep',
    subtitle: 'Become Incubation Ready',
    goal: 'Prepare for incubators, grants, and showcases.',
    docSection: 'Incubation Package',
    tasks: [
      { id: 'pitch_deck', label: 'Pitch deck', hint: 'Story for programs and judges' },
      { id: 'startup_overview', label: 'Startup overview', hint: 'Concise venture summary' },
      { id: 'demo_preparation', label: 'Demo preparation', hint: 'Demo link and notes' },
      { id: 'execution_reports', label: 'Execution reports', hint: 'Contribution and progress log' },
      { id: 'startup_documentation', label: 'Startup documentation', hint: 'Readiness for applications' },
    ],
  },
]

const hasText = (value, min = 8) => typeof value === 'string' && value.trim().length >= min

export function isTaskComplete(taskId, project, { milestones = [], logs = [], feedPostCount = 0 } = {}) {
  if (!project) return false
  const stage = normalizeLifecycleStage(project.lifecycleStage || project.status || project.phase)
  const validation = project.validation?.workspace || {}
  const evidence = validation.evidence || project.validation?.workspace?.evidence || []
  const validationTasks = validation.tasks || []

  switch (taskId) {
    case 'startup_title':
      return hasText(project.title, 2)
    case 'one_line_summary':
      return hasText(project.shortPitch, 12)
    case 'tagline':
      return hasText(project.shortPitch, 8) || (project.tags || []).length > 0
    case 'category':
      return Boolean(project.category)
    case 'startup_identity':
      return hasText(project.description, 24)
    case 'project_keywords':
      return (project.tags || []).length > 0

    case 'founder_inspiration':
      return hasText(project.description, 20) || hasText(project.executionPlan, 20)
    case 'problem_definition':
      return (
        hasText(project.techProduct?.problem, 10)
        || hasText(project.businessStartup?.marketGap, 10)
        || hasText(validation.problemStatement, 10)
      )
    case 'target_audience':
      return (
        hasText(project.techProduct?.targetUsers, 8)
        || hasText(project.businessStartup?.targetAudience, 8)
        || hasText(validation.targetUsers, 8)
      )
    case 'startup_vision':
      return hasText(project.executionPlan, 30) || hasText(project.description, 40)

    case 'startup_stage':
      return Boolean(stage)
    case 'collaborator_requirements':
      return (project.rolesNeeded || []).length > 0 || (project.skillsRequired || []).length > 0
    case 'execution_readiness':
      return hasText(project.executionPlan, 40) && Number(project.numberOfTeammates || 0) >= 1

    case 'surveys':
      return validationTasks.length > 0 || evidence.some((e) => /survey/i.test(e.title || e.kind || ''))
    case 'interviews':
      return hasText(validation.whoSpokenTo, 8) || evidence.some((e) => /interview/i.test(e.title || e.kind || ''))
    case 'feedback_uploads':
      return evidence.length > 0
    case 'user_insights':
      return hasText(validation.surprisingInsights, 12) || hasText(validation.repeatedProblems, 12)
    case 'validation_evidence':
      return evidence.length >= 2 || ['validation', 'incubation_ready', 'mvp'].includes(stage)

    case 'roadmap':
      return milestones.length > 0
    case 'milestone_tracking':
      return milestones.some((m) => m.status === 'completed')
    case 'mvp_uploads':
      return (project.files || []).length > 0 || ['mvp', 'validation', 'incubation_ready'].includes(stage)
    case 'prototype_progress':
      return project.buildPhase?.isActive || ['building', 'mvp', 'validation', 'incubation_ready'].includes(stage)
    case 'sprint_execution':
      return logs.length > 0
    case 'task_management':
      return milestones.some((m) => m.status !== 'completed') || validationTasks.some((t) => t.status !== 'completed')

    case 'milestone_post':
      return feedPostCount > 0
    case 'blocker_post':
      return feedPostCount > 0
    case 'public_update':
      return feedPostCount >= 2

    case 'pitch_deck':
      return stage === 'incubation_ready' || Number(project.readinessScore || 0) >= 75
    case 'startup_overview':
      return hasText(project.shortPitch, 12) && hasText(project.description, 30)
    case 'demo_preparation':
      return hasText(project.validation?.demoLink, 6)
    case 'execution_reports':
      return logs.length >= 3
    case 'startup_documentation':
      return Number(project.readinessScore || 0) >= 60 || stage === 'incubation_ready'

    default:
      return false
  }
}

export function getPhaseProgress(phase, project, context = {}) {
  const tasks = phase.tasks || []
  if (tasks.length === 0) return 0
  const done = tasks.filter((t) => isTaskComplete(t.id, project, context)).length
  return Math.round((done / tasks.length) * 100)
}

export function buildSprintState(project, context = {}) {
  const phases = SPRINT_PHASES.map((phase) => {
    const progress = getPhaseProgress(phase, project, context)
    const tasks = phase.tasks.map((task) => ({
      ...task,
      complete: isTaskComplete(task.id, project, context),
    }))
    return { ...phase, progress, tasks }
  })

  let activePhaseId = phases[0]?.id
  for (const phase of phases) {
    if (phase.progress < 100) {
      activePhaseId = phase.id
      break
    }
    activePhaseId = phase.id
  }

  const overallProgress = Math.round(
    phases.reduce((sum, p) => sum + p.progress, 0) / Math.max(phases.length, 1)
  )

  const phasesWithUnlock = phases.map((phase, index) => {
    const prev = phases[index - 1]
    const unlocked = index === 0 || !prev || prev.progress >= 50
    return { ...phase, unlocked }
  })

  return { phases: phasesWithUnlock, activePhaseId, overallProgress }
}

export function getNextSprintAction(phases, activePhaseId) {
  const active = phases.find((p) => p.id === activePhaseId) || phases[0]
  if (!active) return { title: 'Start your sprint', detail: 'Create a startup workspace.' }
  const nextTask = active.tasks.find((t) => !t.complete)
  if (nextTask) {
    return {
      title: nextTask.label,
      detail: nextTask.hint,
      phaseTitle: active.subtitle,
    }
  }
  const nextPhase = phases.find((p) => p.unlocked && p.progress < 100 && p.id !== active.id)
  if (nextPhase) {
    return {
      title: `Advance to ${nextPhase.subtitle}`,
      detail: nextPhase.goal,
      phaseTitle: nextPhase.subtitle,
    }
  }
  return {
    title: 'Incubation-ready polish',
    detail: 'Refine your package for programs and showcases.',
    phaseTitle: active.subtitle,
  }
}
