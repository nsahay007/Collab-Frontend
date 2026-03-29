import axios from '../../services/axiosInstance'

export const createProject = async (projectData) => {
  try {
    const response = await axios.post('/projects', projectData)
    return response.data
  } catch (error) {
    console.error('Create project error:', error)
    throw error
  }
}

export const getProjects = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters)
    const response = await axios.get(`/projects?${params}`)
    return response.data
  } catch (error) {
    console.error('Get projects error:', error)
    throw error
  }
}

export const getProjectById = async (id) => {
  try {
    const response = await axios.get(`/projects/${id}`)
    return response.data
  } catch (error) {
    console.error('Get project error:', error)
    throw error
  }
}

export const joinProject = async (id) => {
  try {
    const response = await axios.post(`/projects/${id}/join`)
    return response.data
  } catch (error) {
    console.error('Join project error:', error)
    throw error
  }
}

export const respondToJoinRequest = async (id, userId, action) => {
  try {
    const response = await axios.post(`/projects/${id}/respond`, { userId, action })
    return response.data
  } catch (error) {
    console.error('Respond to join request error:', error)
    throw error
  }
}

export const startBuildPhase = async (id) => {
  try {
    const response = await axios.post(`/projects/${id}/start-build`)
    return response.data
  } catch (error) {
    console.error('Start build phase error:', error)
    throw error
  }
}

export const completeProject = async (id) => {
  try {
    const response = await axios.post(`/projects/${id}/complete`)
    return response.data
  } catch (error) {
    console.error('Complete project error:', error)
    throw error
  }
}

export const submitReview = async (id, reviewData) => {
  try {
    const response = await axios.post(`/projects/${id}/review`, reviewData)
    return response.data
  } catch (error) {
    console.error('Submit review error:', error)
    throw error
  }
}

export const markReviewHelpful = async (projectId, reviewId) => {
  try {
    const response = await axios.put(`/projects/${projectId}/reviews/${reviewId}/helpful`)
    return response.data
  } catch (error) {
    console.error('Mark review helpful error:', error)
    throw error
  }
}

export const getValidationProjects = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters)
    const response = await axios.get(`/projects/validation?${params}`)
    return response.data
  } catch (error) {
    console.error('Get validation projects error:', error)
    throw error
  }
}

export const updateActivity = async (id) => {
  try {
    const response = await axios.post(`/projects/${id}/update-activity`)
    return response.data
  } catch (error) {
    console.error('Update activity error:', error)
    throw error
  }
}
