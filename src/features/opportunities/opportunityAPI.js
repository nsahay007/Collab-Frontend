import axiosInstance from '../../services/axiosInstance'

export const getOpportunities = async (type) => {
  const params = type && type !== 'all' ? { type } : {}
  const response = await axiosInstance.get('/opportunities', { params })
  return response.data
}

export const createOpportunity = async (data) => {
  const response = await axiosInstance.post('/opportunities', data)
  return response.data
}

export const updateOpportunity = async (id, data) => {
  const response = await axiosInstance.put(`/opportunities/${id}`, data)
  return response.data
}

export const deleteOpportunity = async (id) => {
  const response = await axiosInstance.delete(`/opportunities/${id}`)
  return response.data
}
