import axios from '../../services/axiosInstance'
import { sanitizeOptionalText, sanitizeText, sanitizeList } from '../../utils/sanitize'

export const fetchVentureDiscovery = async (filters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.append(key, value)
    }
  })
  const response = await axios.get(`/projects/discovery${params.toString() ? `?${params}` : ''}`)
  return response.data
}

export const fetchValidationQueue = async () => {
  const response = await axios.get('/projects/validation?limit=20&page=1')
  return response.data
}

export const fetchVentureMilestones = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}/milestones`)
  return response.data
}

export const createVentureMilestone = async (projectId, payload = {}) => {
  const sanitized = {
    ...payload,
    title: sanitizeText(payload.title || ''),
    description: sanitizeOptionalText(payload.description || ''),
    blockers: sanitizeList(payload.blockers),
    dependencies: sanitizeList(payload.dependencies),
    blockerDetails: Array.isArray(payload.blockerDetails)
      ? payload.blockerDetails.map((blocker) => ({
        ...blocker,
        description: sanitizeOptionalText(blocker.description || '')
      }))
      : []
  }
  const response = await axios.post(`/projects/${projectId}/milestones`, sanitized)
  return response.data
}

export const updateVentureMilestone = async (projectId, milestoneId, payload = {}) => {
  const sanitized = {
    ...payload,
    title: payload.title !== undefined ? sanitizeOptionalText(payload.title || '') : payload.title,
    description: payload.description !== undefined ? sanitizeOptionalText(payload.description || '') : payload.description,
    blockers: payload.blockers !== undefined ? sanitizeList(payload.blockers) : payload.blockers,
    dependencies: payload.dependencies !== undefined ? sanitizeList(payload.dependencies) : payload.dependencies,
    blockerDetails: Array.isArray(payload.blockerDetails)
      ? payload.blockerDetails.map((blocker) => ({
        ...blocker,
        description: sanitizeOptionalText(blocker.description || '')
      }))
      : payload.blockerDetails
  }
  const response = await axios.patch(`/projects/${projectId}/milestones/${milestoneId}`, sanitized)
  return response.data
}

export const fetchContributionLogs = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}/contribution-logs`)
  return response.data
}

export const createContributionLog = async (projectId, payload = {}) => {
  const response = await axios.post(`/projects/${projectId}/contribution-logs`, {
    action: sanitizeText(payload.action || ''),
    impact: sanitizeOptionalText(payload.impact || ''),
    milestoneId: payload.milestoneId || undefined
  })
  return response.data
}

export const updateTeamCheckIn = async (projectId, payload = {}) => {
  const response = await axios.patch(`/projects/${projectId}/team-checkin`, {
    status: payload.status,
    note: sanitizeOptionalText(payload.note || '')
  })
  return response.data
}

export const fetchContinuationPlan = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}/continuation`)
  return response.data
}

export const applyContinuationAction = async (projectId, payload = {}) => {
  const response = await axios.post(`/projects/${projectId}/continuation`, {
    action: payload.action,
    note: sanitizeOptionalText(payload.note || '')
  })
  return response.data
}
