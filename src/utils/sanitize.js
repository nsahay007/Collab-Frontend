import DOMPurify from 'dompurify'

const sanitizeText = (value) => {
  if (typeof value !== 'string') return ''
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
}

const sanitizeOptionalText = (value) => {
  if (!value) return ''
  return sanitizeText(value)
}

const sanitizeList = (items) => {
  const list = Array.isArray(items) ? items : items ? [items] : []
  return list.map((item) => sanitizeText(String(item))).filter(Boolean)
}

export { sanitizeText, sanitizeOptionalText, sanitizeList }
