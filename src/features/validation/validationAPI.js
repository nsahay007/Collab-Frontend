import axios from '../../services/axiosInstance'
import { sanitizeText } from '../../utils/sanitize'

export const fetchValidations = () => axios.get('/validations')

export const submitValidation = (payload) => {
  const sanitized = {
    ...payload,
    feedback: sanitizeText(payload.feedback || '')
  }
  return axios.post('/validations', sanitized)
}

export const removeValidationProject = (projectId) =>
  axios.post(`/projects/${projectId}/validation/remove`)
