import axios from '../../services/axiosInstance'

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
export const createProject = (payload) => axios.post('/projects', payload)
export const expressInterest = (projectId, userId) =>
  axios.post(`/projects/${projectId}/join`, { userId })
export const respondToJoinRequest = (projectId, userId, action) =>
  axios.post(`/projects/${projectId}/respond`, { userId, action })
export const addTeamMember = (projectId, requesterId, userId) =>
  axios.post(`/projects/${projectId}/add-member`, { requesterId, userId })
export const removeTeamMember = (projectId, requesterId, userId) =>
  axios.post(`/projects/${projectId}/remove-member`, { requesterId, userId })
export const addProjectMessage = (projectId, userId, text) =>
  axios.post(`/projects/${projectId}/messages`, { userId, text })
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
export const sendProjectToValidation = (projectId, payload = {}) =>
  axios.post(`/projects/${projectId}/validate`, payload)

export const updateActivity = (projectId) =>
  axios.post(`/projects/${projectId}/update-activity`)

export const markReviewHelpful = (projectId, reviewId) =>
  axios.put(`/projects/${projectId}/reviews/${reviewId}/helpful`)

export const updateProjectRequirements = (projectId, payload) =>
  axios.put(`/projects/${projectId}/requirements`, payload)

export const updateProjectDetails = (projectId, payload) =>
  axios.put(`/projects/${projectId}/details`, payload)
