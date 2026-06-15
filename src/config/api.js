const envBaseUrl = import.meta.env.VITE_API_URL || ''
const BASE_URL = envBaseUrl.includes('qzz.io')
  ? 'https://api.joincollab.org/api'
  : envBaseUrl || (typeof window !== 'undefined' && window.location.hostname.endsWith('joincollab.org')
    ? 'https://api.joincollab.org/api'
    : '')
const normalizedBaseUrl = BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '')

export const apiBaseUrl = normalizedBaseUrl ? `${normalizedBaseUrl}/api` : ''
export const uploadsBaseUrl = normalizedBaseUrl
