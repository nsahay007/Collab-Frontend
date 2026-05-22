export const VENTURE_LIFECYCLE = [
  'idea',
  'validation',
  'team_formation',
  'prototype',
  'mvp',
  'growth',
  'incubation_ready',
  'pivoted',
  'archived'
]

export const LINEAR_LIFECYCLE = [
  'idea',
  'validation',
  'team_formation',
  'prototype',
  'mvp',
  'growth',
  'incubation_ready'
]

export const LIFECYCLE_LABELS = {
  idea: 'Idea',
  validation: 'Validation',
  team_formation: 'Team Formation',
  prototype: 'Prototype',
  mvp: 'MVP',
  growth: 'Growth',
  incubation_ready: 'Incubation Ready',
  pivoted: 'Pivoted',
  archived: 'Archived'
}

export const LIFECYCLE_PROMPTS = {
  idea: 'Clarify the problem, user, and execution thesis.',
  validation: 'Test assumptions and collect evidence before scaling the team.',
  team_formation: 'Fill the critical roles needed to execute.',
  prototype: 'Build the first usable product path and resolve blockers.',
  mvp: 'Package a usable MVP and prepare external validation.',
  growth: 'Turn validated learning into traction and repeatable usage.',
  incubation_ready: 'Prepare the venture story, evidence, and operating metrics.',
  pivoted: 'Use feedback to choose a sharper direction.',
  archived: 'This venture is no longer active.'
}

const LEGACY_STATUS_MAP = {
  planning: 'idea',
  building: 'prototype',
  completed: 'mvp',
  validation: 'mvp',
  validated: 'incubation_ready',
  validation_failed: 'pivoted',
  archived: 'archived'
}

const LEGACY_PHASE_MAP = {
  problem: 'idea',
  plan: 'validation',
  build: 'prototype',
  mvp: 'mvp',
  validation: 'mvp',
  demo: 'growth'
}

export const normalizeLifecycleStage = (value, fallback = 'idea') => {
  if (typeof value !== 'string') return fallback
  const normalized = value.trim().toLowerCase()
  if (VENTURE_LIFECYCLE.includes(normalized)) return normalized
  return LEGACY_STATUS_MAP[normalized] || LEGACY_PHASE_MAP[normalized] || fallback
}

export const getLifecycleLabel = (stage) => LIFECYCLE_LABELS[normalizeLifecycleStage(stage)] || 'Idea'

export const getLifecycleProgress = (stage) => {
  const normalized = normalizeLifecycleStage(stage)
  if (normalized === 'pivoted') return 35
  if (normalized === 'archived') return 100
  const index = LINEAR_LIFECYCLE.indexOf(normalized)
  if (index < 0) return 0
  return Math.round(((index + 1) / LINEAR_LIFECYCLE.length) * 100)
}

export const getNextLifecycleStage = (stage) => {
  const normalized = normalizeLifecycleStage(stage)
  if (normalized === 'pivoted') return 'validation'
  if (normalized === 'archived' || normalized === 'incubation_ready') return null
  const index = LINEAR_LIFECYCLE.indexOf(normalized)
  if (index < 0 || index >= LINEAR_LIFECYCLE.length - 1) return null
  return LINEAR_LIFECYCLE[index + 1]
}

export const getNextLifecycleLabel = (stage) => {
  const next = getNextLifecycleStage(stage)
  return next ? getLifecycleLabel(next) : 'No next stage'
}

export const getLifecyclePrompt = (stage) => LIFECYCLE_PROMPTS[normalizeLifecycleStage(stage)] || LIFECYCLE_PROMPTS.idea

export const getLifecycleVariant = (stage) => {
  const normalized = normalizeLifecycleStage(stage)
  if (normalized === 'incubation_ready' || normalized === 'growth') return 'success'
  if (normalized === 'pivoted') return 'warning'
  if (normalized === 'archived') return 'default'
  return 'primary'
}
