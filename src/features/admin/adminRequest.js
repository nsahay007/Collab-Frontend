export const adminErrorMessage = (error, fallback = 'Admin action failed') =>
  error?.response?.data?.message || error?.message || fallback

export const adminDebug = (label, payload, response, error) => {
  if (!import.meta.env.DEV) return
  if (error) {
    console.error(`[admin:${label}] failed`, { payload, error })
  } else {
    console.debug(`[admin:${label}]`, { payload, response })
  }
}

export const runAdminRequest = async (label, request, { setStatus, setLoading, payload } = {}) => {
  setLoading?.(true)
  setStatus?.(`${label}...`)
  try {
    adminDebug(label, payload)
    const response = await request()
    adminDebug(label, payload, response)
    setStatus?.(`${label} complete`)
    return response
  } catch (error) {
    const message = adminErrorMessage(error)
    adminDebug(label, payload, null, error)
    setStatus?.(message)
    throw error
  } finally {
    setLoading?.(false)
  }
}
