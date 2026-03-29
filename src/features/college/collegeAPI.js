import axios from '../../services/axiosInstance'

export const getAllColleges = async () => {
  try {
    const response = await axios.get('/colleges/all')
    return response.data
  } catch (error) {
    console.error('Get colleges error:', error)
    throw error
  }
}

export const searchColleges = async (query) => {
  try {
    const response = await axios.get(`/colleges/search/${query}`)
    return response.data
  } catch (error) {
    console.error('Search colleges error:', error)
    throw error
  }
}
