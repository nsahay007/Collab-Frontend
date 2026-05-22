export const VENTURE_LIFECYCLE = [
  'idea',
  'planning',
  'building',
  'mvp',
  'validation',
  'incubation_ready',
  'pivoted',
  'archived'
]

export const LINEAR_LIFECYCLE = [
  'idea',
  'planning',
  'building',
  'mvp',
  'validation',
  'incubation_ready'
]

export const LIFECYCLE_LABELS = {
  idea: 'Idea',
  planning: 'Planning',
  building: 'Building',
  mvp: 'MVP',
  validation: 'Validation',
  incubation_ready: 'Incubation Ready',
  pivoted: 'Pivoted',
  archived: 'Archived'
}

export const LIFECYCLE_PROMPTS = {
  idea: 'Clarify the startup name, problem, users, and why this matters.',
  planning: 'Turn the concept into milestones, feature scope, roles, goals, and a simple execution timeline.',
  building: 'Build the prototype, upload progress, resolve blockers, and keep the team moving.',
  mvp: 'Narrow the MVP scope, prepare testing, and organize demo-ready proof.',
  validation: 'Run self-conducted surveys, interviews, testing, and feedback collection.',
  incubation_ready: 'Organize the startup summary, validation report, team details, execution history, and pitch structure.',
  pivoted: 'Use feedback to choose a sharper direction.',
  archived: 'This venture is no longer active.'
}

export const LIFECYCLE_QUESTIONS = {
  idea: [
    'What problem are you solving?',
    'Who faces this problem?',
    'Why does this matter?',
    'What makes your idea different?'
  ],
  planning: [
    'What features will your MVP include?',
    'What roles does your team have?',
    'What milestone comes first?',
    'What is your short-term roadmap?'
  ],
  building: [
    'What did your team build this week?',
    'What blocker slowed progress?',
    'What feature was completed?',
    'What milestone comes next?'
  ],
  mvp: [
    'What can users do in your MVP?',
    'What remains incomplete?',
    'What feedback have you received?',
    'Is the prototype testable?'
  ],
  validation: [
    'Who tested your product?',
    'What repeated feedback appeared?',
    'Would users actually use or pay for this?',
    'What changed after validation?'
  ],
  incubation_ready: [
    'Is the startup summary complete?',
    'Is milestone history organized?',
    'Is the validation summary ready?',
    'Is the incubation packet ready to share?'
  ],
  pivoted: [
    'What did the team learn?',
    'What direction changes now?'
  ],
  archived: [
    'What should be preserved for future reference?'
  ]
}

export const LIFECYCLE_NEXT_ACTIONS = {
  idea: 'Answer the idea questions and convert the strongest assumptions into a first planning milestone.',
  planning: 'Create the first milestone, assign owners, and define the MVP feature scope.',
  building: 'Post this week’s build update, log blockers, and complete the next milestone.',
  mvp: 'Summarize what the MVP can do, upload prototype proof, and prepare it for testing.',
  validation: 'Run self-conducted testing, record repeated feedback, and upload evidence.',
  incubation_ready: 'Review the incubation packet, pitch structure, certificates, and execution history.',
  pivoted: 'Clarify the new direction and restart planning.',
  archived: 'Keep the workspace as a reference record.'
}

const LEGACY_STATUS_MAP = {
  planning: 'planning',
  building: 'building',
  completed: 'mvp',
  validation: 'validation',
  validated: 'incubation_ready',
  validation_failed: 'pivoted',
  team_formation: 'planning',
  prototype: 'building',
  growth: 'incubation_ready',
  archived: 'archived'
}

const LEGACY_PHASE_MAP = {
  problem: 'idea',
  plan: 'planning',
  build: 'building',
  mvp: 'mvp',
  validation: 'validation',
  demo: 'mvp'
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
  if (normalized === 'pivoted') return 'planning'
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

export const getLifecycleQuestions = (stage) => LIFECYCLE_QUESTIONS[normalizeLifecycleStage(stage)] || LIFECYCLE_QUESTIONS.idea

export const getLifecycleNextAction = (stage) => LIFECYCLE_NEXT_ACTIONS[normalizeLifecycleStage(stage)] || LIFECYCLE_NEXT_ACTIONS.idea

export const getLifecycleVariant = (stage) => {
  const normalized = normalizeLifecycleStage(stage)
  if (normalized === 'incubation_ready') return 'success'
  if (normalized === 'pivoted') return 'warning'
  if (normalized === 'archived') return 'default'
  return 'primary'
}
