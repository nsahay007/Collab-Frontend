import axios from '../../services/axiosInstance'
import { sanitizeText, sanitizeList } from '../../utils/sanitize'

export const getProfile = async () => {
  const response = await axios.get('/users/me')
  return response.data
}

export const updateProfile = async (payload) => {
  const sanitized = {
    ...payload,
    name: sanitizeText(payload.name || ''),
    course: sanitizeText(payload.course || ''),
    yearOfStudy: sanitizeText(payload.yearOfStudy || ''),
    primaryCategory: sanitizeText(payload.primaryCategory || ''),
    phone: sanitizeText(payload.phone || ''),
    skills: sanitizeList(payload.skills)
  }
  const response = await axios.put('/users/me', sanitized)
  return response.data
}

export const getUserProjects = async (lifecycleStage = 'all') => {
  const response = await axios.get(`/users/projects?lifecycleStage=${lifecycleStage}`)
  return response.data
}

export const getRank = async () => {
  const response = await axios.get('/users/rank')
  return response.data
}

export const getExecutionProfile = async () => {
  const response = await axios.get('/users/execution-profile')
  return response.data
}

export const getUserActivity = async (activeWithin) => {
  const query = activeWithin ? `?activeWithin=${activeWithin}` : ''
  const response = await axios.get(`/users/activity${query}`)
  return response.data
}

export const getAdminStats = async () => {
  const response = await axios.get('/users/admin-stats')
  return response.data
}

export const getUserById = async (userId) => {
  const response = await axios.get(`/users/${userId}`)
  return response.data
}

export const createUserByAdmin = async (payload) => {
  const sanitized = {
    ...payload,
    name: sanitizeText(payload.name || ''),
    email: sanitizeText(payload.email || ''),
    course: sanitizeText(payload.course || ''),
    yearOfStudy: sanitizeText(payload.yearOfStudy || ''),
    primaryCategory: sanitizeText(payload.primaryCategory || ''),
    phone: sanitizeText(payload.phone || ''),
    skills: sanitizeList(payload.skills)
  }
  const response = await axios.post('/users', sanitized)
  return response.data
}

export const updateUserByAdmin = async (userId, payload) => {
  const sanitized = {
    ...payload,
    name: payload.name ? sanitizeText(payload.name) : payload.name,
    course: payload.course ? sanitizeText(payload.course) : payload.course,
    yearOfStudy: payload.yearOfStudy ? sanitizeText(payload.yearOfStudy) : payload.yearOfStudy,
    primaryCategory: payload.primaryCategory ? sanitizeText(payload.primaryCategory) : payload.primaryCategory,
    phone: payload.phone ? sanitizeText(payload.phone) : payload.phone,
    skills: payload.skills ? sanitizeList(payload.skills) : payload.skills
  }
  const response = await axios.patch(`/users/${userId}`, sanitized)
  return response.data
}

export const deleteUserByAdmin = async (userId) => {
  const response = await axios.delete(`/users/${userId}`)
  return response.data
}
