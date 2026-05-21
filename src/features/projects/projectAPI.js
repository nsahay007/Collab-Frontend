import axios from '../../services/axiosInstance'
import { sanitizeText, sanitizeOptionalText, sanitizeList } from '../../utils/sanitize'

export const fetchProjects = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.college) params.append('college', filters.college)
  if (filters.category) params.append('category', filters.category)
  if (filters.status) params.append('status', filters.status)
  if (filters.skills && filters.skills !== 'all') {
    params.append('skills', filters.skills)
  }
  if (filters.roles && filters.roles !== 'all') {
    params.append('roles', filters.roles)
  }
  const query = params.toString()
  return axios.get(`/projects${query ? `?${query}` : ''}`)
}
export const fetchProject = (id) => axios.get(`/projects/${id}`)
export const fetchProjectOptions = () => axios.get('/projects/options')
export const createProject = (payload) => {
  const sanitized = {
    ...payload,
    title: sanitizeText(payload.title),
    shortPitch: sanitizeText(payload.shortPitch),
    description: sanitizeOptionalText(payload.description || ''),
    category: sanitizeText(payload.category),
    tags: sanitizeList(payload.tags),
    rolesNeeded: sanitizeList(payload.rolesNeeded),
    skillsRequired: sanitizeList(payload.skillsRequired),
    executionPlan: sanitizeText(payload.executionPlan || '')
  }
  return axios.post('/projects', sanitized)
}
export const expressInterest = (projectId, userId) =>
  axios.post(`/projects/${projectId}/join`, { userId })
export const respondToJoinRequest = (projectId, userId, action) =>
  axios.post(`/projects/${projectId}/respond`, { userId, action })
export const addTeamMember = (projectId, requesterId, userId) =>
  axios.post(`/projects/${projectId}/add-member`, { requesterId, userId })
export const removeTeamMember = (projectId, requesterId, userId) =>
  axios.post(`/projects/${projectId}/remove-member`, { requesterId, userId })
export const addProjectMessage = (projectId, userId, text) =>
  axios.post(`/projects/${projectId}/messages`, { userId, text: sanitizeText(text) })
export const deleteProject = (projectId) =>
  axios.delete(`/projects/${projectId}`)
export const uploadProjectFile = (projectId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post(`/projects/${projectId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const deleteProjectFile = (projectId, fileId) =>
  axios.delete(`/projects/${projectId}/files/${fileId}`)
export const sendProjectToValidation = (projectId, payload = {}) => {
  const sanitized = {
    ...payload,
    demoLink: sanitizeOptionalText(payload.demoLink || ''),
    demoNotes: sanitizeOptionalText(payload.demoNotes || ''),
    sharedFileIds: payload.sharedFileIds
  }
  return axios.post(`/projects/${projectId}/validate`, sanitized)
}

export const extendValidationTimeline = (projectId) =>
  axios.post(`/projects/${projectId}/validation/extend`, {})

export const updateValidationWorkspace = (projectId, payload = {}) => {
  const assumptions = Array.isArray(payload.coreAssumptions)
    ? payload.coreAssumptions.map((item) => sanitizeOptionalText(item || ''))
    : []

  const tasks = Array.isArray(payload.validationTasks)
    ? payload.validationTasks.map((task) => ({
      taskId: task?.taskId,
      title: sanitizeOptionalText(task?.title || ''),
      status: task?.status === 'completed' ? 'completed' : 'pending',
      dueDate: task?.dueDate,
      completedAt: task?.completedAt
    }))
    : []

  const evidence = Array.isArray(payload.validationEvidence)
    ? payload.validationEvidence.map((item) => ({
      evidenceId: item?.evidenceId,
      kind: sanitizeOptionalText(item?.kind || 'other'),
      title: sanitizeOptionalText(item?.title || ''),
      summary: sanitizeOptionalText(item?.summary || ''),
      link: sanitizeOptionalText(item?.link || ''),
      createdAt: item?.createdAt
    }))
    : []

  const sanitized = {
    problemStatement: sanitizeOptionalText(payload.problemStatement || ''),
    targetUsers: sanitizeOptionalText(payload.targetUsers || ''),
    coreAssumptions: assumptions.filter(Boolean),
    validationTasks: tasks.filter((task) => task.title),
    validationEvidence: evidence.filter((item) => item.title),
    confidenceScore: Number.isFinite(Number(payload.confidenceScore))
      ? Number(payload.confidenceScore)
      : 0
  }

  return axios.put(`/projects/${projectId}/validation/workspace`, sanitized)
}

export const updateActivity = (projectId) =>
  axios.post(`/projects/${projectId}/update-activity`)

export const markReviewHelpful = (projectId, reviewId) =>
  axios.put(`/projects/${projectId}/reviews/${reviewId}/helpful`)

export const updateProjectRequirements = (projectId, payload) => {
  const sanitized = {
    ...payload,
    rolesNeeded: sanitizeList(payload.rolesNeeded),
    skillsRequired: sanitizeList(payload.skillsRequired)
  }
  return axios.put(`/projects/${projectId}/requirements`, sanitized)
}

export const updateProjectDetails = (projectId, payload) => {
  const sanitized = {
    ...payload,
    title: sanitizeOptionalText(payload.title || ''),
    shortPitch: sanitizeOptionalText(payload.shortPitch || ''),
    description: sanitizeOptionalText(payload.description || ''),
    executionPlan: sanitizeOptionalText(payload.executionPlan || ''),
    tags: sanitizeList(payload.tags)
  }
  return axios.put(`/projects/${projectId}/details`, sanitized)
}
