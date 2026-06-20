import axios from '../../services/axiosInstance'

export const getAdminLogs = async () => {
  const response = await axios.get('/admin/logs')
  return response.data
}
