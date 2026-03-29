import axios from '../../services/axiosInstance'

export const getNotifications = async (page = 1, limit = 20) => {
  const response = await axios.get(`/notifications?page=${page}&limit=${limit}`)
  return response.data
}

export const markNotificationRead = async (id) => {
  const response = await axios.put(`/notifications/${id}/read`)
  return response.data
}

export const markAllNotificationsRead = async () => {
  const response = await axios.put('/notifications/read-all')
  return response.data
}
