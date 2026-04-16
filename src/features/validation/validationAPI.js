import axios from '../../services/axiosInstance'
import { sanitizeText } from '../../utils/sanitize'

export const fetchValidations = () => axios.get('/validations')

export const submitValidation = (payload) => {
  const sanitized = {
    ...payload,
    feedback: sanitizeText(payload.feedback || ''),
    topStrengths: sanitizeText(payload.topStrengths || ''),
    topGaps: sanitizeText(payload.topGaps || ''),
    biggestRisk: sanitizeText(payload.biggestRisk || ''),
    next7DayAction: sanitizeText(payload.next7DayAction || '')
  }
  return axios.post('/validations', sanitized)
}

export const removeValidationProject = (projectId) =>
  axios.post(`/projects/${projectId}/validation/remove`)
