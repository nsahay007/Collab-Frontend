const storageKey = (projectId) => `collab-sprint-v2-${projectId}`

export function loadSprintMeta(projectId) {
  if (!projectId) return {}
  try {
    const raw = localStorage.getItem(storageKey(projectId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveSprintMeta(projectId, patch) {
  if (!projectId) return
  const current = loadSprintMeta(projectId)
  localStorage.setItem(storageKey(projectId), JSON.stringify({ ...current, ...patch }))
}

export function getProblemFromProject(project) {
  const v = project?.validation?.workspace
  return (
    project?.techProduct?.problem
    || project?.businessStartup?.marketGap
    || v?.problemStatement
    || ''
  )
}

export function getAudienceFromProject(project) {
  const v = project?.validation?.workspace
  return (
    project?.techProduct?.targetUsers
    || project?.businessStartup?.targetAudience
    || v?.targetUsers
    || ''
  )
}

export function getDescriptorWords(project, meta) {
  if (Array.isArray(meta?.descriptorWords) && meta.descriptorWords.length) {
    return meta.descriptorWords.slice(0, 3)
  }
  return (project?.tags || []).slice(0, 3)
}
