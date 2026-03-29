import axios from '../../services/axiosInstance'

export const fetchValidations = () => axios.get('/validations')

export const submitValidation = (payload) => axios.post('/validations', payload)
