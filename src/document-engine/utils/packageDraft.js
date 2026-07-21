export const draftKey = (projectId = 'mock') => `collab:project-package:${projectId}`

export const loadPackageDraft = (projectId) => {
  try {
    return JSON.parse(localStorage.getItem(draftKey(projectId)) || '{}')
  } catch {
    return {}
  }
}

export const savePackageDraft = (projectId, draft) => {
  localStorage.setItem(draftKey(projectId), JSON.stringify(draft || {}))
}

export const clearDocumentDraft = (draft, keys = []) => {
  const next = { ...draft }
  keys.forEach((key) => delete next[key])
  return next
}
