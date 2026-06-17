import axios from '../../services/axiosInstance'

export const getAdminProjectRecords = async () => {
  const response = await axios.get('/admin/project-records')
  return response.data
}

export const getAdminProjectRecord = async (projectId) => {
  const response = await axios.get(`/admin/project-records/${projectId}`)
  return response.data
}

export const updateAdminProjectRecord = async (projectId, payload) => {
  const response = await axios.patch(`/admin/project-records/${projectId}`, payload)
  return response.data
}

export const addAdminProjectMember = async (projectId, userId) => {
  const response = await axios.post(`/admin/project-records/${projectId}/team`, { userId })
  return response.data
}

export const removeAdminProjectMember = async (projectId, userId) => {
  const response = await axios.delete(`/admin/project-records/${projectId}/team/${userId}`)
  return response.data
}

export const updateAdminProjectOwner = async (projectId, userId) => {
  const response = await axios.patch(`/admin/project-records/${projectId}/owner`, { userId })
  return response.data
}

export const updateAdminProjectMilestone = async (projectId, milestoneId, payload) => {
  const response = await axios.patch(`/admin/project-records/${projectId}/milestones/${milestoneId}`, payload)
  return response.data
}

export const removeAdminProjectMilestone = async (projectId, milestoneId) => {
  const response = await axios.delete(`/admin/project-records/${projectId}/milestones/${milestoneId}`)
  return response.data
}

export const updateAdminProjectBlocker = async (projectId, milestoneId, blockerId, payload) => {
  const response = await axios.patch(`/admin/project-records/${projectId}/milestones/${milestoneId}/blockers/${blockerId}`, payload)
  return response.data
}

export const removeAdminProjectFile = async (projectId, fileId) => {
  const response = await axios.delete(`/admin/project-records/${projectId}/files/${fileId}`)
  return response.data
}

export const archiveAdminProjectRecord = async (projectId) => {
  const response = await axios.patch(`/admin/project-records/${projectId}/archive`)
  return response.data
}

export const restoreAdminProjectRecord = async (projectId, lifecycleStage = 'idea') => {
  const response = await axios.patch(`/admin/project-records/${projectId}/restore`, { lifecycleStage })
  return response.data
}

export const permanentlyRemoveAdminProjectRecord = async (projectId) => {
  const response = await axios.delete(`/admin/project-records/${projectId}/permanent`, {
    data: { confirm: 'PERMANENTLY_DELETE_PROJECT' }
  })
  return response.data
}
