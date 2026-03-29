const BASE_URL = import.meta.env.VITE_API_URL || ''
const normalizedBaseUrl = BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '')

export const apiBaseUrl = normalizedBaseUrl ? `${normalizedBaseUrl}/api` : ''
export const uploadsBaseUrl = normalizedBaseUrl
