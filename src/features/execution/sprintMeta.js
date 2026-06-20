export function loadSprintMeta(projectId) {
  return {}
}

export function saveSprintMeta(projectId, patch) {
  return null
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
  const pipelineWords = project?.pipeline?.foundation?.descriptorWords
  if (Array.isArray(pipelineWords) && pipelineWords.length) {
    return pipelineWords.slice(0, 3)
  }
  return ['', '', '']
}
