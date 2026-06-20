import axios from '../../services/axiosInstance'
import { sanitizeList, sanitizeOptionalText, sanitizeText } from '../../utils/sanitize'

const cleanCategoryPayload = (value = {}) => {
  if (!value || typeof value !== 'object') return undefined
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      Array.isArray(entry)
        ? sanitizeList(entry)
        : sanitizeOptionalText(String(entry || ''))
    ])
  )
}

export const createProject = async (payload = {}) => {
  const response = await axios.post('/projects', {
    ...payload,
    title: sanitizeText(payload.title || ''),
    shortPitch: sanitizeText(payload.shortPitch || ''),
    description: sanitizeText(payload.description || ''),
    category: sanitizeText(payload.category || ''),
    tags: sanitizeList(payload.tags),
    rolesNeeded: sanitizeList(payload.rolesNeeded),
    skillsRequired: sanitizeList(payload.skillsRequired),
    executionPlan: sanitizeText(payload.executionPlan || ''),
    techProduct: cleanCategoryPayload(payload.techProduct),
    businessStartup: cleanCategoryPayload(payload.businessStartup),
    designCreative: cleanCategoryPayload(payload.designCreative),
    marketingContent: cleanCategoryPayload(payload.marketingContent),
    servicesOperations: cleanCategoryPayload(payload.servicesOperations)
  })
  return response.data
}

export const fetchProject = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}`)
  return response.data
}

export const downloadStartupPackage = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}/startup-package.zip`, {
    responseType: 'blob'
  })
  return response.data
}

export const downloadCertificates = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}/certificates.zip`, {
    responseType: 'blob'
  })
  return response.data
}

export const downloadCreationRecord = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}/creation-record.pdf`, {
    responseType: 'blob'
  })
  return response.data
}

export const downloadVentureProvenanceReport = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}/provenance-report.pdf`, {
    responseType: 'blob'
  })
  return response.data
}

export const fetchProjectAccessHistory = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}/access-history`)
  return response.data
}

export const fetchDiscoverProjects = async ({
  lifecycleStage = 'all',
  category,
  page = 1,
  limit = 30
} = {}) => {
  const query = new URLSearchParams({
    lifecycleStage,
    page: String(page),
    limit: String(limit)
  })
  if (category && category !== 'all') {
    query.set('category', category)
  }
  const response = await axios.get(`/projects?${query.toString()}`)
  return response.data
}

export const updateProjectDetails = async (projectId, payload = {}) => {
  const response = await axios.put(`/projects/${projectId}/details`, {
    title: payload.title !== undefined ? sanitizeText(payload.title || '') : undefined,
    shortPitch: payload.shortPitch !== undefined ? sanitizeText(payload.shortPitch || '') : undefined,
    description: payload.description !== undefined ? sanitizeOptionalText(payload.description || '') : undefined,
    tags: payload.tags !== undefined ? sanitizeList(payload.tags) : undefined,
    executionPlan: payload.executionPlan !== undefined ? sanitizeText(payload.executionPlan || '') : undefined,
    pipeline: payload.pipeline
  })
  return response.data
}

export const updateProjectRequirements = async (projectId, payload = {}) => {
  const response = await axios.put(`/projects/${projectId}/requirements`, {
    rolesNeeded: payload.rolesNeeded !== undefined ? sanitizeList(payload.rolesNeeded) : undefined,
    skillsRequired: payload.skillsRequired !== undefined ? sanitizeList(payload.skillsRequired) : undefined,
    numberOfTeammates: payload.numberOfTeammates,
    visibility: payload.visibility
  })
  return response.data
}

export const updateValidationWorkspace = async (projectId, payload = {}) => {
  const response = await axios.put(`/projects/${projectId}/validation/workspace`, {
    problemStatement: payload.problemStatement !== undefined ? sanitizeOptionalText(payload.problemStatement || '') : undefined,
    targetUsers: payload.targetUsers !== undefined ? sanitizeOptionalText(payload.targetUsers || '') : undefined,
    coreAssumptions: payload.coreAssumptions !== undefined ? sanitizeList(payload.coreAssumptions) : undefined,
    whoSpokenTo: payload.whoSpokenTo !== undefined ? sanitizeOptionalText(payload.whoSpokenTo || '') : undefined,
    repeatedProblems: payload.repeatedProblems !== undefined ? sanitizeOptionalText(payload.repeatedProblems || '') : undefined,
    surprisingInsights: payload.surprisingInsights !== undefined ? sanitizeOptionalText(payload.surprisingInsights || '') : undefined,
    useOrPaySignal: payload.useOrPaySignal !== undefined ? sanitizeOptionalText(payload.useOrPaySignal || '') : undefined,
    feedbackChanges: payload.feedbackChanges !== undefined ? sanitizeOptionalText(payload.feedbackChanges || '') : undefined,
    validationTasks: payload.validationTasks,
    validationEvidence: Array.isArray(payload.validationEvidence)
      ? payload.validationEvidence.map((item) => ({
        ...item,
        title: sanitizeText(item.title || ''),
        summary: sanitizeOptionalText(item.summary || ''),
        link: sanitizeOptionalText(item.link || '')
      }))
      : payload.validationEvidence,
    confidenceScore: payload.confidenceScore
  })
  return response.data
}

export const addProjectMessage = async (projectId, _userId, text) => {
  const response = await axios.post(`/projects/${projectId}/messages`, {
    text: sanitizeText(text || '')
  })
  return response.data
}

export const removeTeamMember = async (projectId, requesterId, userId) => {
  const response = await axios.post(`/projects/${projectId}/remove-member`, { requesterId, userId })
  return response.data
}

export const addTeamMember = async (projectId, userId) => {
  const response = await axios.post(`/projects/${projectId}/add-member`, { userId })
  return response.data
}

export const deleteProject = async (projectId) => {
  const response = await axios.delete(`/projects/${projectId}`)
  return response.data
}

export const createMilestone = async (projectId, payload = {}) => {
  const response = await axios.post(`/projects/${projectId}/milestones`, {
    title: sanitizeText(payload.title || ''),
    description: sanitizeOptionalText(payload.description || ''),
    lifecycleStage: payload.lifecycleStage,
    dueDate: payload.dueDate,
    status: payload.status || 'pending',
  })
  return response.data
}

export const updateMilestone = async (projectId, milestoneId, payload = {}) => {
  const response = await axios.patch(`/projects/${projectId}/milestones/${milestoneId}`, {
    status: payload.status,
    title: payload.title !== undefined ? sanitizeText(payload.title || '') : undefined,
    description: payload.description !== undefined ? sanitizeOptionalText(payload.description || '') : undefined
  })
  return response.data
}

export const applyContinuationAction = async (projectId, payload = {}) => {
  const response = await axios.post(`/projects/${projectId}/continuation`, {
    action: payload.action,
    note: sanitizeOptionalText(payload.note || '')
  })
  return response.data
}

export const uploadProjectFile = async (projectId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`/projects/${projectId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteProjectFile = async (projectId, fileId) => {
  const response = await axios.delete(`/projects/${projectId}/files/${fileId}`)
  return response.data
}

export const sendProjectToValidation = async (projectId, payload = {}) => {
  const response = await axios.post(`/projects/${projectId}/validate`, {
    demoLink: sanitizeOptionalText(payload.demoLink || ''),
    demoNotes: sanitizeOptionalText(payload.demoNotes || ''),
    sharedFileIds: payload.sharedFileIds || []
  })
  return response.data
}

export const extendValidationTimeline = async (projectId) => {
  const response = await axios.post(`/projects/${projectId}/validation/extend`, {})
  return response.data
}
