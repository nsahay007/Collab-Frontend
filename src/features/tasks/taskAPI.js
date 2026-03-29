import axios from '../../services/axiosInstance'

export const fetchTasks = () => axios.get('/tasks')
