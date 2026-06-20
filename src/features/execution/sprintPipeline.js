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
    id: 'incubation',
    number: 6,
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
  const pipeline = project.pipeline || {}
  const { milestones = [] } = context
  const v = project.validation?.workspace || {}
  const evidence = v.evidence || []

  const checks = {
    foundation: () => {
      let n = 0
      if (hasText(project.title, 2)) n++
      if (hasText(project.shortPitch, 12)) n++
      if (hasText(pipeline.foundation?.tagline || meta.tagline, 3)) n++
      if (getDescriptorWords(project, meta).filter(Boolean).length >= 2) n++
      if (project.category) n++
      return Math.round((n / 5) * 100)
    },
    purpose: () => {
      let n = 0
      if (hasText(pipeline.purpose?.founderInspiration || meta.founderInspiration, 20)) n++
      if (hasText(getProblemFromProject(project), 30)) n++
      if (hasText(getAudienceFromProject(project), 15)) n++
      if (hasText(pipeline.purpose?.impactStatement || meta.impact, 20)) n++
      return Math.round((n / 4) * 100)
    },
    readiness: () => {
      let n = 0
      if (normalizeLifecycleStage(project.lifecycleStage)) n++
      if ((project.rolesNeeded || []).length > 0) n++
      if (hasText(pipeline.readiness?.notes || meta.collaboratorNotes, 10) || hasText(project.executionPlan, 30)) n++
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
      const roadmapScore = hasText(pipeline.mvp?.roadmap || project.executionPlan, 40) || hasText(meta.roadmap, 40) ? 25 : 0
      const milestoneScore = milestones.length
        ? Math.round((milestones.filter((m) => m.status === 'completed').length / milestones.length) * 50)
        : 0
      const assetScore = pipeline.mvp?.demoLinks?.length || pipeline.mvp?.githubLinks?.length || pipeline.mvp?.figmaLinks?.length || meta.mvpDemo || meta.mvpGithub || meta.mvpFigma || (project.files || []).length ? 25 : 0
      return Math.min(100, roadmapScore + milestoneScore + assetScore)
    },
    incubation: () => {
      let n = 0
      if (hasText(pipeline.incubation?.pitchDeckLinks?.[0] || meta.pitchDeckLink, 6)) n++
      if (hasText(pipeline.incubation?.demoVideoLinks?.[0] || meta.demoVideoLink, 6) || hasText(project.validation?.demoLink, 6)) n++
      if (hasText(pipeline.incubation?.startupOverview || pipeline.incubation?.executiveSummary || meta.overviewNotes, 30)) n++
      if (Number(project.readinessScore || 0) >= 50 || (milestones.length > 0 && milestones.every((m) => m.status === 'completed'))) n++
      return Math.round((n / 4) * 100)
    },
  }

  return checks[phaseId]?.() ?? 0
}

function blockDone(block) {
  if (!block || typeof block !== 'object') return false
  const link = typeof block.link === 'string' ? block.link.trim() : ''
  const notes = typeof block.notes === 'string' ? block.notes.trim() : ''
  return Boolean(link || notes.length > 20)
}

export function buildSprintState(project, context = {}) {
  const phases = SPRINT_PHASES.map((phase) => {
    let progress = 0
    try {
      progress = getPhaseProgress(phase.id, project, context)
    } catch (err) {
      console.warn(`Sprint progress failed for ${phase.id}:`, err)
    }
    return {
      ...phase,
      progress: Number.isFinite(progress) ? progress : 0,
    }
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
    execution: { title: 'Complete your checklist', detail: 'Mark setup milestones complete as your MVP takes shape.' },
    incubation: { title: 'Save incubation package', detail: 'Add pitch/demo assets and finish the preparation stage.' },
  }

  const hint = hints[active.id] || { title: active.subtitle, detail: active.goal }
  return { ...hint, phaseTitle: active.subtitle }
}
