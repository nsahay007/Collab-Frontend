import { normalizeLifecycleStage } from '../../utils/ventureLifecycle'
import {
  loadSprintMeta,
  getProblemFromProject,
  getAudienceFromProject,
  getDescriptorWords,
} from './sprintMeta'

export const SPRINT_PHASES = [
  {
    id: 'foundation',
    number: 1,
    title: 'Foundation',
    subtitle: 'Define Your Startup',
    goal: 'Create startup identity and clarity — exciting, lightweight, welcoming.',
    docSection: 'Identity & Positioning',
    theme: 'foundation',
  },
  {
    id: 'purpose',
    number: 2,
    title: 'Purpose & Vision',
    subtitle: 'Why Does This Matter?',
    goal: 'Connect problem, audience, inspiration, and impact.',
    docSection: 'Purpose Narrative',
    theme: 'purpose',
  },
  {
    id: 'readiness',
    number: 3,
    title: 'Execution Readiness',
    subtitle: 'Prepare to Build',
    goal: 'Align stage and collaborator needs before you ship.',
    docSection: 'Team & Execution Setup',
    theme: 'readiness',
  },
  {
    id: 'validation',
    number: 4,
    title: 'Validation',
    subtitle: 'Prove The Problem Exists',
    goal: 'Collect evidence that demand is real.',
    docSection: 'Market Validation Report',
    theme: 'validation',
  },
  {
    id: 'execution',
    number: 5,
    title: 'MVP Building',
    subtitle: 'Build The Startup',
    goal: 'Roadmap, milestones, MVP assets, and active execution.',
    docSection: 'Build Log & MVP Record',
    theme: 'mvp',
  },
  {
    id: 'public',
    number: 6,
    title: 'Public Building',
    subtitle: 'Build With The Ecosystem',
    goal: 'Share milestones and blockers on the Feed.',
    docSection: 'Public Execution Timeline',
    theme: 'public',
  },
  {
    id: 'incubation',
    number: 7,
    title: 'Incubation Preparation',
    subtitle: 'Become Incubation Ready',
    goal: 'Pitch assets, demo, and application-ready documentation.',
    docSection: 'Incubation Package',
    theme: 'incubation',
  },
]

const hasText = (value, min = 8) => typeof value === 'string' && value.trim().length >= min

export function getPhaseProgress(phaseId, project, context = {}) {
  if (!project) return 0
  const meta = loadSprintMeta(project._id || project.id)
  const { milestones = [], logs = [], feedPostCount = 0 } = context
  const v = project.validation?.workspace || {}
  const evidence = v.evidence || []

  const checks = {
    foundation: () => {
      let n = 0
      if (hasText(project.title, 2)) n++
      if (hasText(project.shortPitch, 12)) n++
      if (hasText(meta.tagline, 3)) n++
      if (getDescriptorWords(project, meta).filter(Boolean).length >= 2) n++
      if (project.category) n++
      return Math.round((n / 5) * 100)
    },
    purpose: () => {
      let n = 0
      if (hasText(meta.founderInspiration, 20)) n++
      if (hasText(getProblemFromProject(project), 30)) n++
      if (hasText(getAudienceFromProject(project), 15)) n++
      if (hasText(meta.impact, 20)) n++
      return Math.round((n / 4) * 100)
    },
    readiness: () => {
      let n = 0
      if (normalizeLifecycleStage(project.lifecycleStage)) n++
      if ((project.rolesNeeded || []).length > 0) n++
      if (hasText(meta.collaboratorNotes, 10) || hasText(project.executionPlan, 30)) n++
      return Math.round((n / 3) * 100)
    },
    validation: () => {
      let n = 0
      const blocks = meta.validationBlocks || {}
      if (blockDone(blocks.surveys) || evidence.some((e) => /survey/i.test(e.title || ''))) n++
      if (blockDone(blocks.interviews) || hasText(v.whoSpokenTo, 8)) n++
      if (blockDone(blocks.feedback) || hasText(v.repeatedProblems, 12)) n++
      return Math.round((n / 3) * 100)
    },
    execution: () => {
      let n = 0
      if (hasText(project.executionPlan, 40) || hasText(meta.roadmap, 40)) n++
      if (milestones.length > 0) n++
      if (milestones.some((m) => m.status === 'completed')) n++
      if (meta.mvpDemo || meta.mvpGithub || meta.mvpFigma || (project.files || []).length) n++
      if (logs.length > 0) n++
      return Math.round((n / 5) * 100)
    },
    public: () => {
      if (feedPostCount >= 2) return 100
      if (feedPostCount >= 1) return 50
      return 0
    },
    incubation: () => {
      let n = 0
      if (hasText(meta.pitchDeckLink, 6)) n++
      if (hasText(meta.demoVideoLink, 6) || hasText(project.validation?.demoLink, 6)) n++
      if (hasText(meta.overviewNotes, 30)) n++
      if (Number(project.readinessScore || 0) >= 50) n++
      return Math.round((n / 4) * 100)
    },
  }

  return checks[phaseId]?.() ?? 0
}

function blockDone(block) {
  return Boolean(block?.link?.trim() || block?.notes?.trim().length > 20)
}

export function buildSprintState(project, context = {}) {
  const phases = SPRINT_PHASES.map((phase) => ({
    ...phase,
    progress: getPhaseProgress(phase.id, project, context),
  }))

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
    const unlocked = index === 0 || !prev || prev.progress >= 40
    return { ...phase, unlocked }
  })

  return { phases: phasesWithUnlock, activePhaseId, overallProgress }
}

export function getNextSprintAction(phases, activePhaseId) {
  const active = phases.find((p) => p.id === activePhaseId) || phases[0]
  if (!active) {
    return { title: 'Start your sprint', detail: 'Create a startup workspace.' }
  }

  const hints = {
    foundation: { title: 'Name your startup', detail: 'Complete each identity question in its own section.' },
    purpose: { title: 'Define the problem', detail: 'Use the dedicated problem field — be specific about pain.' },
    readiness: { title: 'Select your stage', detail: 'Add roles you need on the team.' },
    validation: { title: 'Upload survey proof', detail: 'Add links or files in the validation blocks.' },
    execution: { title: 'Create your first milestone', detail: 'Add roadmap and track build progress.' },
    public: { title: 'Post a milestone', detail: 'Share execution momentum on the Feed.' },
    incubation: { title: 'Upload pitch deck', detail: 'Close gaps shown in the readiness checklist.' },
  }

  const hint = hints[active.id] || { title: active.subtitle, detail: active.goal }
  return { ...hint, phaseTitle: active.subtitle }
}
