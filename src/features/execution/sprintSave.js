import {
  updateProjectDetails,
  updateProjectRequirements,
  updateValidationWorkspace,
  uploadProjectFile,
  applyContinuationAction,
} from '../projects/projectAPI'
import { saveSprintMeta, getDescriptorWords } from './sprintMeta'

const CATEGORIES = [
  'Tech & Product',
  'Business & Startup',
  'Design & Creative',
  'Marketing & Content',
  'Services & Operations',
]

const STAGE_MAP = {
  idea: 'idea',
  planning: 'planning',
  building: 'building',
  testing: 'mvp',
  launched: 'incubation_ready',
}

export async function saveFoundationPhase(projectId, data) {
  const words = (data.descriptorWords || []).map((w) => w.trim()).filter(Boolean).slice(0, 3)
  await updateProjectDetails(projectId, {
    title: data.startupName,
    shortPitch: data.elevatorPitch,
    tags: words,
    category: data.category,
  })
  saveSprintMeta(projectId, {
    tagline: data.tagline,
    descriptorWords: words,
  })
}

export async function savePurposePhase(projectId, data) {
  const description = [
    `Founder inspiration: ${data.inspiration}`,
    '',
    `Problem: ${data.problem}`,
    `Audience: ${data.audience}`,
    '',
    `Impact if successful: ${data.impact}`,
  ].join('\n')

  await updateProjectDetails(projectId, {
    description,
    executionPlan: data.impact ? `Vision & impact:\n${data.impact}` : undefined,
  })
  await updateValidationWorkspace(projectId, {
    problemStatement: data.problem,
    targetUsers: data.audience,
    surprisingInsights: data.impact,
  })
  saveSprintMeta(projectId, {
    founderInspiration: data.inspiration,
    impact: data.impact,
  })
}

export async function saveReadinessPhase(projectId, data) {
  const roles = (data.roles || []).map((r) => r.trim()).filter(Boolean)
  await updateProjectRequirements(projectId, {
    rolesNeeded: roles,
    skillsRequired: data.skills || [],
  })
  saveSprintMeta(projectId, {
    sprintStage: data.stage,
    collaboratorNotes: data.collaboratorNotes,
  })
}

export async function saveValidationPhase(projectId, data) {
  const evidence = []
  const pushEvidence = (block, kind, title) => {
    if (block?.link?.trim()) {
      evidence.push({
        evidenceId: `${kind}-${Date.now()}`,
        kind,
        title,
        summary: block.notes || '',
        link: block.link.trim(),
      })
    } else if (block?.notes?.trim()) {
      evidence.push({
        evidenceId: `${kind}-${Date.now()}`,
        kind,
        title,
        summary: block.notes.trim(),
        link: '',
      })
    }
  }
  pushEvidence(data.surveys, 'survey', 'Survey proof')
  pushEvidence(data.interviews, 'interview', 'Interview proof')
  pushEvidence(data.feedback, 'feedback', 'Feedback proof')

  await updateValidationWorkspace(projectId, {
    whoSpokenTo: data.interviews?.notes || '',
    repeatedProblems: data.feedback?.notes || '',
    surprisingInsights: data.surveys?.notes || '',
    validationEvidence: evidence,
  })
  saveSprintMeta(projectId, { validationBlocks: data })
}

export async function uploadValidationFile(projectId, file, label) {
  if (!file) return null
  const result = await uploadProjectFile(projectId, file)
  return { label, file: result }
}

export async function saveIncubationPhase(projectId, data) {
  saveSprintMeta(projectId, {
    pitchDeckLink: data.pitchDeckLink,
    demoVideoLink: data.demoVideoLink,
    overviewNotes: data.overviewNotes,
  })
  await applyContinuationAction(projectId, {
    action: 'prepare_incubation',
    note: 'Saved final incubation package from the guided pipeline.'
  })
}

export { CATEGORIES, STAGE_MAP, getDescriptorWords }
