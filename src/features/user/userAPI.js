import axios from '../../services/axiosInstance'

export const getProfile = async () => {
  const response = await axios.get('/users/me')
  return response.data
}

export const updateProfile = async (payload) => {
  const response = await axios.put('/users/me', payload)
  return response.data
}

export const getUserProjects = async (status = 'all') => {
  const response = await axios.get(`/users/projects?status=${status}`)
  return response.data
}

export const getLeaderboard = async (college = 'all', page = 1, limit = 50) => {
  const response = await axios.get(`/users/leaderboard?college=${college}&page=${page}&limit=${limit}`)
  return response.data
}

export const getRank = async () => {
  const response = await axios.get('/users/rank')
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
  const response = await axios.post('/users', payload)
  return response.data
}

export const updateUserByAdmin = async (userId, payload) => {
  const response = await axios.patch(`/users/${userId}`, payload)
  return response.data
}

export const deleteUserByAdmin = async (userId) => {
  const response = await axios.delete(`/users/${userId}`)
  return response.data
}
