import React, { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import {
  fetchProject,
  expressInterest,
  respondToJoinRequest,
  addTeamMember,
  removeTeamMember,
  addProjectMessage,
  deleteProject,
  uploadProjectFile,
  sendProjectToValidation,
  extendValidationTimeline,
  markReviewHelpful,
  updateProjectRequirements,
  updateProjectDetails,
  deleteProjectFile,
  updateValidationWorkspace
} from '../features/projects/projectAPI'
import useAuth from '../hooks/useAuth'
import checkIcon from '../assets/icons/check.svg'
import { uploadsBaseUrl } from '../config/api'

const WORKSPACE_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'validation', label: 'Validation' },
  { id: 'team', label: 'Team' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'build-progress', label: 'Build Progress' },
  { id: 'assets', label: 'Assets' },
  { id: 'updates', label: 'Updates' },
  { id: 'contributors', label: 'Contributors' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'settings', label: 'Settings' }
]

const LIFECYCLE_STEPS = ['Idea', 'Validation', 'Prototype', 'MVP', 'Incubation Ready']

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chatMessage, setChatMessage] = useState('')
  const [chatError, setChatError] = useState('')
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [removeFileId, setRemoveFileId] = useState(null)
  const [removeFileError, setRemoveFileError] = useState('')
  const [validating, setValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [extendingTimeline, setExtendingTimeline] = useState(false)
  const [extendTimelineError, setExtendTimelineError] = useState('')
  const [helpfulError, setHelpfulError] = useState('')
  const [helpfulLoading, setHelpfulLoading] = useState(null)
  const [validationLink, setValidationLink] = useState('')
  const [validationNotes, setValidationNotes] = useState('')
  const [sharedFileIds, setSharedFileIds] = useState([])
  const [timeLeft, setTimeLeft] = useState('')
  const [timeExpired, setTimeExpired] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [requirementsForm, setRequirementsForm] = useState({
    rolesNeeded: '',
    skillsRequired: '',
    numberOfTeammates: 1,
    visibility: 'private'
  })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsSaving, setDetailsSaving] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const [detailsForm, setDetailsForm] = useState({
    title: '',
    shortPitch: '',
    description: '',
    tags: '',
    executionPlan: ''
  })
  const [activeSection, setActiveSection] = useState('overview')
  const [workspaceForm, setWorkspaceForm] = useState({
    problemStatement: '',
    targetUsers: '',
    assumptionsText: '',
    confidenceScore: 0,
    tasks: [],
    evidence: []
  })
  const [workspaceTaskInput, setWorkspaceTaskInput] = useState('')
  const [workspaceEvidenceInput, setWorkspaceEvidenceInput] = useState({
    kind: 'feedback',
    title: '',
    summary: '',
    link: ''
  })
  const [workspaceSaving, setWorkspaceSaving] = useState(false)
  const [workspaceError, setWorkspaceError] = useState('')
  const [workspaceSuccess, setWorkspaceSuccess] = useState('')

  const loadProject = useCallback(async () => {
    try {
      const response = await fetchProject(id)
      if (response?.data) {
        setProject(response.data)
      } else {
        setError('Venture not found')
      }
    } catch (err) {
      console.error('Error loading venture', err)
      setError('Failed to load venture')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  useEffect(() => {
    if (!project) return
    setValidationLink(project.validation?.demoLink || '')
    setValidationNotes(project.validation?.demoNotes || '')
    const existingShared = project.validation?.sharedFiles || []
    setSharedFileIds(existingShared.map((file) => file._id || file.filename).filter(Boolean))

    const workspace = project.validation?.workspace || {}
    const assumptions = Array.isArray(workspace.coreAssumptions) ? workspace.coreAssumptions : []
    setWorkspaceForm({
      problemStatement: workspace.problemStatement || '',
      targetUsers: workspace.targetUsers || '',
      assumptionsText: assumptions.join('\n'),
      confidenceScore: Number.isFinite(Number(workspace.confidenceScore))
        ? Number(workspace.confidenceScore)
        : 0,
      tasks: Array.isArray(workspace.tasks) ? workspace.tasks : [],
      evidence: Array.isArray(workspace.evidence) ? workspace.evidence : []
    })
  }, [project])

  const userId = user?._id || user?.id
  const ownerId = project?.owner?._id || project?.owner?.id
  const isOwner = Boolean(userId && ownerId && userId === ownerId)
  const hasInterest = project?.interestedUsers?.some((u) => (u._id === userId || u.id === userId))
  const isTeamMember = project?.teamMembers?.some((u) => (u._id === userId || u.id === userId))
  const canChat = Boolean(isTeamMember)
  const maxTeamMembers = project?.numberOfTeammates || 1
  const teamCount = project?.teamMembers?.length || 0
  const teamFull = teamCount >= maxTeamMembers
  const validationData = project?.validation || {}
  const validationReviewCount = validationData.currentReviews || validationData.reviews?.length || 0
  const validationRequired = validationData.reviewsRequired || 30
  const criteriaAverages = validationData.criteriaAverages || {}
  const hasExtendedTimeline = Boolean(project?.buildPhase?.isExtendedTimeline)
  const extensionCount = project?.buildPhase?.extensionCount || 0
  const canSeeOnlineStatus = Boolean(isOwner || isTeamMember)
  const workspaceTasks = Array.isArray(workspaceForm.tasks) ? workspaceForm.tasks : []
  const workspaceEvidence = Array.isArray(workspaceForm.evidence) ? workspaceForm.evidence : []
  const completedWorkspaceTasks = workspaceTasks.filter((task) => task.status === 'completed').length
  const pendingWorkspaceTasks = Math.max(0, workspaceTasks.length - completedWorkspaceTasks)
  const validationProgress = workspaceTasks.length > 0
    ? Math.round((completedWorkspaceTasks / workspaceTasks.length) * 100)
    : Math.round(Number(workspaceForm.confidenceScore || 0))
  const validationTimelineEntries = [
    ...workspaceTasks.map((task) => ({
      type: 'task',
      title: task.title,
      status: task.status,
      at: task.updatedAt || task.completedAt || task.dueDate
    })),
    ...workspaceEvidence.map((entry) => ({
      type: 'evidence',
      title: entry.title,
      status: entry.kind || 'logged',
      at: entry.createdAt
    }))
  ]
    .filter((entry) => entry.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10)

  const isOnline = (member) => {
    if (!member?.lastActive) return false
    const lastActive = new Date(member.lastActive).getTime()
    if (!lastActive) return false
    return Date.now() - lastActive <= 5 * 60 * 1000
  }

  const normalizeLabel = (value) => {
    if (typeof value !== 'string') return ''
    const trimmed = value.trim()
    if (!trimmed) return ''
    return trimmed
      .split(/\\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const normalizeList = (value) => {
    if (!value) return []
    return value
      .split(',')
      .map((item) => normalizeLabel(item))
      .filter(Boolean)
  }

  const visibilityLabel = (value) => {
    if (value === 'private') return 'Private (Only Team)'
    if (value === 'college') return 'College Only'
    return 'Global'
  }

  const resolveProjectFileUrl = (file) => {
    if (!file) return ''
    if (file.downloadUrl) return file.downloadUrl
    if (file.filename) return `${uploadsBaseUrl}/uploads/${file.filename}`
    return ''
  }

  const handleInterest = async () => {
    if (!userId) return
    try {
      await expressInterest(id, userId)
      await loadProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddMember = async (memberId) => {
    if (!userId) return
    try {
      await addTeamMember(id, userId, memberId)
      await loadProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectMember = async (memberId) => {
    if (!userId) return
    try {
      await respondToJoinRequest(id, memberId, 'reject')
      await loadProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendMessage = async () => {
    const trimmed = chatMessage.trim()
    if (!trimmed) return
    if (!userId) return
    try {
      setChatError('')
      await addProjectMessage(id, userId, trimmed)
      setChatMessage('')
      await loadProject()
    } catch (err) {
      console.error(err)
      setChatError(err?.response?.data?.message || 'Unable to send message right now.')
    }
  }

  const openRemoveModal = (member) => {
    setRemoveError('')
    setRemoveTarget(member)
    setRemoveOpen(true)
  }

  const openEditRequirements = () => {
    setEditError('')
    setRequirementsForm({
      rolesNeeded: (project?.rolesNeeded || []).join(', '),
      skillsRequired: (project?.skillsRequired || []).join(', '),
      numberOfTeammates: project?.numberOfTeammates || 1,
      visibility: project?.visibility || 'private'
    })
    setEditOpen(true)
  }

  const openEditDetails = () => {
    setDetailsError('')
    setDetailsForm({
      title: project?.title || '',
      shortPitch: project?.shortPitch || '',
      description: project?.description || '',
      tags: (project?.tags || []).join(', '),
      executionPlan: project?.executionPlan || ''
    })
    setDetailsOpen(true)
  }

  const closeEditDetails = () => {
    setDetailsOpen(false)
    setDetailsError('')
  }

  const handleDetailsSave = async () => {
    try {
      setDetailsSaving(true)
      setDetailsError('')
      const payload = {
        title: detailsForm.title,
        shortPitch: detailsForm.shortPitch,
        description: detailsForm.description,
        tags: detailsForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        executionPlan: detailsForm.executionPlan
      }
      await updateProjectDetails(id, payload)
      await loadProject()
      setDetailsOpen(false)
    } catch (err) {
      console.error(err)
      setDetailsError(err?.response?.data?.message || 'Unable to update venture details.')
    } finally {
      setDetailsSaving(false)
    }
  }

  const closeEditRequirements = () => {
    setEditOpen(false)
    setEditError('')
  }

  const handleRequirementsSave = async () => {
    try {
      setEditSaving(true)
      setEditError('')
      const payload = {
        rolesNeeded: normalizeList(requirementsForm.rolesNeeded),
        skillsRequired: normalizeList(requirementsForm.skillsRequired),
        numberOfTeammates: parseInt(requirementsForm.numberOfTeammates, 10) || 1,
        visibility: requirementsForm.visibility
      }
      await updateProjectRequirements(id, payload)
      await loadProject()
      setEditOpen(false)
    } catch (err) {
      console.error(err)
      setEditError(err?.response?.data?.message || 'Unable to update requirements right now.')
    } finally {
      setEditSaving(false)
    }
  }

  const closeRemoveModal = () => {
    setRemoveOpen(false)
    setRemoveTarget(null)
    setRemoveError('')
  }

  const toggleSharedFile = (fileId) => {
    if (!fileId) return
    setSharedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((idValue) => idValue !== fileId) : [...prev, fileId]
    )
  }

  const jumpToSection = (sectionId) => {
    setActiveSection(sectionId)
    const element = document.getElementById(`workspace-${sectionId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const addValidationTask = () => {
    const title = workspaceTaskInput.trim()
    if (!title) return
    const task = {
      taskId: `task-${Date.now()}`,
      title,
      status: 'pending',
      updatedAt: new Date().toISOString()
    }
    setWorkspaceForm((prev) => ({ ...prev, tasks: [...prev.tasks, task] }))
    setWorkspaceTaskInput('')
  }

  const removeValidationTask = (taskId) => {
    setWorkspaceForm((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.taskId !== taskId)
    }))
  }

  const toggleValidationTask = (taskId) => {
    setWorkspaceForm((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => {
        if (task.taskId !== taskId) return task
        const nextCompleted = task.status !== 'completed'
        return {
          ...task,
          status: nextCompleted ? 'completed' : 'pending',
          updatedAt: new Date().toISOString(),
          completedAt: nextCompleted ? new Date().toISOString() : undefined
        }
      })
    }))
  }

  const addValidationEvidence = () => {
    const title = workspaceEvidenceInput.title.trim()
    if (!title) return
    const evidence = {
      evidenceId: `evidence-${Date.now()}`,
      kind: workspaceEvidenceInput.kind || 'other',
      title,
      summary: workspaceEvidenceInput.summary.trim(),
      link: workspaceEvidenceInput.link.trim(),
      createdAt: new Date().toISOString()
    }
    setWorkspaceForm((prev) => ({ ...prev, evidence: [evidence, ...prev.evidence] }))
    setWorkspaceEvidenceInput({
      kind: 'feedback',
      title: '',
      summary: '',
      link: ''
    })
  }

  const removeValidationEvidence = (evidenceId) => {
    setWorkspaceForm((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((entry) => entry.evidenceId !== evidenceId)
    }))
  }

  const saveValidationWorkspace = async () => {
    try {
      setWorkspaceSaving(true)
      setWorkspaceError('')
      setWorkspaceSuccess('')

      const coreAssumptions = workspaceForm.assumptionsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)

      await updateValidationWorkspace(id, {
        problemStatement: workspaceForm.problemStatement,
        targetUsers: workspaceForm.targetUsers,
        coreAssumptions,
        validationTasks: workspaceForm.tasks,
        validationEvidence: workspaceForm.evidence,
        confidenceScore: workspaceForm.confidenceScore
      })

      setWorkspaceSuccess('Validation workspace updated.')
      await loadProject()
    } catch (err) {
      console.error(err)
      setWorkspaceError(err?.response?.data?.message || 'Unable to update validation workspace.')
    } finally {
      setWorkspaceSaving(false)
    }
  }

  const handleRemoveMember = async () => {
    const targetId = removeTarget?._id || removeTarget?.id
    if (!userId || !targetId) return
    try {
      setRemoving(true)
      setRemoveError('')
      await removeTeamMember(id, userId, targetId)
      await loadProject()
      closeRemoveModal()
    } catch (err) {
      console.error(err)
      setRemoveError(err?.response?.data?.message || 'Unable to remove this contributor. Please try again.')
    } finally {
      setRemoving(false)
    }
  }

  const openDeleteModal = () => {
    setDeleteError('')
    setDeleteOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteOpen(false)
    setDeleteError('')
  }

  const handleDeleteProject = async () => {
    if (!id) return
    try {
      setDeleting(true)
      await deleteProject(id)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setDeleteError(err?.response?.data?.message || 'Unable to delete venture.')
    } finally {
      setDeleting(false)
    }
  }

  const handleMarkHelpful = async (reviewId) => {
    if (!reviewId) return
    try {
      setHelpfulError('')
      setHelpfulLoading(reviewId)
      await markReviewHelpful(id, reviewId)
      await loadProject()
    } catch (err) {
      console.error(err)
      setHelpfulError(err?.response?.data?.message || 'Unable to mark feedback helpful.')
    } finally {
      setHelpfulLoading(null)
    }
  }

  const updateTimeLeft = useCallback(() => {
    const endDate = project?.buildPhase?.endDate
    if (!endDate) {
      setTimeLeft('')
      setTimeExpired(false)
      return
    }
    const diff = new Date(endDate).getTime() - Date.now()
    if (diff <= 0) {
      setTimeExpired(true)
      setTimeLeft('Time expired')
      return
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    setTimeExpired(false)
    setTimeLeft(`${days}d ${hours}h ${minutes}m`)
  }, [project?.buildPhase?.endDate])

  const handleFileUpload = async () => {
    if (!selectedFile) return
    try {
      setUploading(true)
      setUploadError('')
      await uploadProjectFile(id, selectedFile)
      setSelectedFile(null)
      await loadProject()
    } catch (err) {
      console.error(err)
      setUploadError(err?.response?.data?.message || 'Failed to upload file.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = async (file) => {
    if (!file) return
    const fileId = file._id || file.filename
    if (!fileId) return
    try {
      setRemoveFileError('')
      setRemoveFileId(fileId)
      await deleteProjectFile(id, fileId)
      await loadProject()
    } catch (err) {
      console.error(err)
      setRemoveFileError(err?.response?.data?.message || 'Unable to remove file.')
    } finally {
      setRemoveFileId(null)
    }
  }

  const handleSendToValidation = async () => {
    try {
      setValidating(true)
      setValidationError('')
      await sendProjectToValidation(id, {
        demoLink: validationLink,
        demoNotes: validationNotes,
        sharedFileIds
      })
      await loadProject()
      setActiveSection('validation')
      setWorkspaceSuccess('Venture moved into validation inside this workspace.')
    } catch (err) {
      console.error(err)
      setValidationError(err?.response?.data?.message || 'Unable to send venture to validation.')
    } finally {
      setValidating(false)
    }
  }

  const handleExtendTimeline = async () => {
    try {
      setExtendingTimeline(true)
      setExtendTimelineError('')
      await extendValidationTimeline(id)
      await loadProject()
    } catch (err) {
      console.error(err)
      setExtendTimelineError(err?.response?.data?.message || 'Unable to extend timeline right now.')
    } finally {
      setExtendingTimeline(false)
    }
  }

  useEffect(() => {
    if (!canChat) return undefined
    const interval = setInterval(() => {
      loadProject()
    }, 8000)
    return () => clearInterval(interval)
  }, [canChat, loadProject])

  useEffect(() => {
    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000)
    return () => clearInterval(interval)
  }, [updateTimeLeft])

  const sectionCardClass = (sectionId) => (
    activeSection === sectionId ? 'border-primary/35 ring-1 ring-primary/30' : ''
  )

  if (loading) {
    return <div>Loading venture...</div>
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">{error || 'Venture not found'}</h1>
        <p className="text-text-secondary max-w-md">Please go back and select another venture.</p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{project.title}</h1>
          <p className="text-text-secondary">{project.description}</p>
          <div className="text-sm text-text-muted">Owner: {project.owner?.name || 'Unknown'}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={project.status === 'validated' ? 'success' : project.status === 'building' ? 'primary' : 'default'}>
              {(project.status === 'validation_failed' ? 'Validation Failed' : (project.status || 'planning'))
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </Badge>
            {hasExtendedTimeline && (
              <Badge variant="accent">
                Extended Timeline{extensionCount > 0 ? ` x${extensionCount}` : ''}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {!isOwner && !isTeamMember && !hasInterest && (
            <Button className="w-full sm:w-auto" onClick={handleInterest}>Show Interest</Button>
          )}
          {isTeamMember && <Badge variant="primary">Joined</Badge>}
          {isOwner && <Badge variant="primary">Team Lead</Badge>}
          {isOwner && (
            <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={openEditDetails}>
              Edit Details
            </Button>
          )}
          {isOwner && (
            <Button variant="danger" size="sm" className="w-full sm:w-auto" onClick={openDeleteModal}>
              Delete Venture
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4" hover={false}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Venture Workspace</h2>
            <p className="text-xs text-text-muted">Your startup HQ: discovery, execution, and validation in one place.</p>
          </div>
          <Badge variant="default">Current: {activeSection.replace(/-/g, ' ')}</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {WORKSPACE_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => jumpToSection(section.id)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium text-left transition ${
                activeSection === section.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border-default bg-bg-card text-text-secondary hover:border-primary/35 hover:text-text-primary'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card id="workspace-overview" className={sectionCardClass('overview')}>
            <h2 className="text-xl font-bold text-text-primary mb-3">Venture Overview</h2>
            <p className="text-text-secondary leading-relaxed">{project.description}</p>
          </Card>

          <Card className={sectionCardClass('overview')}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-text-primary">Requirements</h2>
              {isOwner && (
                <Button variant="secondary" size="sm" onClick={openEditRequirements}>
                  Edit Requirements
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-text-primary mb-2">Roles Needed</div>
                <div className="flex flex-wrap gap-2">
                  {(project.rolesNeeded || []).length ? (
                    project.rolesNeeded.map((role) => (
                      <Badge variant="default" key={role}>{role}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted">No roles listed</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary mb-2">Skills Required</div>
                <div className="flex flex-wrap gap-2">
                  {(project.skillsRequired || []).length ? (
                    project.skillsRequired.map((skill) => (
                      <Badge variant="default" key={skill}>{skill}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted">No skills listed</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-text-muted">
                Team size (including lead): {maxTeamMembers} · Visibility: {visibilityLabel(project.visibility || 'private')}
              </div>
            </div>
          </Card>

          <Card id="workspace-milestones" className={sectionCardClass('milestones')}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-text-primary">Milestones</h2>
              <Badge variant="primary">{String(project.phase || 'problem').toUpperCase()}</Badge>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Execution lifecycle is unified inside this venture workspace.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {['problem', 'plan', 'build', 'mvp', 'validation', 'demo'].map((phaseLabel) => {
                const currentPhase = String(project.phase || 'problem')
                const ordered = ['problem', 'plan', 'build', 'mvp', 'validation', 'demo']
                const currentIndex = ordered.indexOf(currentPhase)
                const phaseIndex = ordered.indexOf(phaseLabel)
                const completed = phaseIndex < currentIndex
                const active = phaseIndex === currentIndex

                return (
                  <div
                    key={phaseLabel}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : completed
                          ? 'border-success/30 bg-success/10 text-success'
                          : 'border-border-default bg-bg-card text-text-muted'
                    }`}
                  >
                    {completed ? '✔' : active ? '→' : '○'} {phaseLabel.toUpperCase()}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card id="workspace-roadmap" className={sectionCardClass('roadmap')}>
            <h2 className="text-xl font-bold text-text-primary mb-2">Roadmap</h2>
            <p className="text-sm text-text-secondary mb-4">
              Idea → Validation → Prototype → MVP → Incubation Ready
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {LIFECYCLE_STEPS.map((step, index) => (
                <div
                  key={step}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-card px-3 py-2 text-xs text-text-secondary"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
                    {index + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </Card>

          <Card id="workspace-validation" className={sectionCardClass('validation')}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Validation</h2>
                <p className="text-sm text-text-secondary">
                  Discovery work inside the venture lifecycle. No separate validation workflow.
                </p>
              </div>
              <Badge variant="default">{validationProgress}% confidence</Badge>
            </div>

            <div className="h-2 w-full rounded-full bg-bg-secondary mb-4">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-primary-accent transition-all"
                style={{ width: `${Math.max(0, Math.min(100, validationProgress))}%` }}
              />
            </div>

            {(isOwner || isTeamMember) ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-secondary">Problem Statement</label>
                    <textarea
                      rows={4}
                      value={workspaceForm.problemStatement}
                      onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, problemStatement: event.target.value }))}
                      placeholder="What problem is being solved?"
                      className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border-default bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary">Target Users</label>
                    <textarea
                      rows={4}
                      value={workspaceForm.targetUsers}
                      onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, targetUsers: event.target.value }))}
                      placeholder="Who is this startup for?"
                      className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border-default bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary">Core Assumptions (one per line)</label>
                  <textarea
                    rows={4}
                    value={workspaceForm.assumptionsText}
                    onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, assumptionsText: event.target.value }))}
                    placeholder={'Users struggle to find technical cofounders.\nStudents need structured startup collaboration.'}
                    className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border-default bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border-default bg-bg-secondary/40 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-text-primary">Validation Tasks</h3>
                      <span className="text-xs text-text-muted">{completedWorkspaceTasks} done · {pendingWorkspaceTasks} pending</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={workspaceTaskInput}
                        onChange={(event) => setWorkspaceTaskInput(event.target.value)}
                        placeholder="Interview users / run survey / waitlist test"
                      />
                      <Button variant="secondary" size="sm" onClick={addValidationTask}>Add</Button>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {workspaceTasks.length > 0 ? workspaceTasks.map((task) => (
                        <div key={task.taskId} className="rounded-lg border border-border-default bg-bg-card p-2 flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={task.status === 'completed'}
                            onChange={() => toggleValidationTask(task.taskId)}
                          />
                          <div className="flex-1">
                            <p className={`text-sm ${task.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary'}`}>{task.title}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeValidationTask(task.taskId)}
                            className="text-xs text-error hover:text-error/80"
                          >
                            Remove
                          </button>
                        </div>
                      )) : (
                        <p className="text-xs text-text-muted">No tasks yet. Add task-based validation goals.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border-default bg-bg-secondary/40 p-3 space-y-3">
                    <h3 className="text-sm font-semibold text-text-primary">Validation Evidence</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <select
                        value={workspaceEvidenceInput.kind}
                        onChange={(event) => setWorkspaceEvidenceInput((prev) => ({ ...prev, kind: event.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border-default bg-bg-card text-text-primary text-sm"
                      >
                        <option value="survey">Survey</option>
                        <option value="interview">Interview</option>
                        <option value="waitlist">Waitlist</option>
                        <option value="feedback">Beta Feedback</option>
                        <option value="experiment">Experiment</option>
                        <option value="insight">Insight</option>
                        <option value="other">Other</option>
                      </select>
                      <Input
                        value={workspaceEvidenceInput.title}
                        onChange={(event) => setWorkspaceEvidenceInput((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="Evidence title"
                      />
                      <textarea
                        rows={2}
                        value={workspaceEvidenceInput.summary}
                        onChange={(event) => setWorkspaceEvidenceInput((prev) => ({ ...prev, summary: event.target.value }))}
                        placeholder="What did you learn?"
                        className="w-full resize-none px-3 py-2 rounded-lg border border-border-default bg-bg-card text-text-primary text-sm"
                      />
                      <Input
                        value={workspaceEvidenceInput.link}
                        onChange={(event) => setWorkspaceEvidenceInput((prev) => ({ ...prev, link: event.target.value }))}
                        placeholder="Link to screenshot/doc/video"
                      />
                      <Button variant="secondary" size="sm" onClick={addValidationEvidence}>Add Evidence</Button>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {workspaceEvidence.length > 0 ? workspaceEvidence.map((entry) => (
                        <div key={entry.evidenceId} className="rounded-lg border border-border-default bg-bg-card p-2 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-text-primary">{entry.title}</p>
                            <button
                              type="button"
                              onClick={() => removeValidationEvidence(entry.evidenceId)}
                              className="text-xs text-error hover:text-error/80"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-xs text-text-muted">{entry.kind}</p>
                          {entry.summary && <p className="text-xs text-text-secondary">{entry.summary}</p>}
                          {entry.link && (
                            <a href={entry.link} target="_blank" rel="noreferrer" className="text-xs text-primary hover:text-primary-hover break-all">
                              {entry.link}
                            </a>
                          )}
                        </div>
                      )) : (
                        <p className="text-xs text-text-muted">No evidence logged yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary">Validation Confidence</label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={workspaceForm.confidenceScore}
                      onChange={(event) => setWorkspaceForm((prev) => ({ ...prev, confidenceScore: Number(event.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-sm font-semibold text-text-primary">{workspaceForm.confidenceScore}%</span>
                  </div>
                </div>

                {workspaceError && <p className="text-xs text-error">{workspaceError}</p>}
                {workspaceSuccess && <p className="text-xs text-success">{workspaceSuccess}</p>}
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" onClick={saveValidationWorkspace} disabled={workspaceSaving}>
                    {workspaceSaving ? 'Saving...' : 'Save Validation Workspace'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">{workspaceForm.problemStatement || 'Problem statement not shared yet.'}</p>
                <p className="text-sm text-text-secondary">{workspaceForm.targetUsers || 'Target users not shared yet.'}</p>
                <p className="text-xs text-text-muted">Only venture contributors can edit validation workspace.</p>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-border-default bg-bg-secondary/30 p-3">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Validation Timeline</h3>
              {validationTimelineEntries.length > 0 ? (
                <div className="space-y-2">
                  {validationTimelineEntries.map((entry, index) => (
                    <div key={`${entry.type}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="uppercase text-text-muted mr-2">{entry.type}</span>
                        <span className="text-text-secondary">{entry.title}</span>
                      </div>
                      <span className="text-text-muted">{new Date(entry.at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No validation activity yet.</p>
              )}
            </div>
          </Card>

          <Card id="workspace-team" className={sectionCardClass('team')}>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              Team Contributors ({teamCount}/{maxTeamMembers})
            </h2>
            <div className="space-y-2">
              {(project.teamMembers || []).map((member) => {
                const memberId = member._id || member.id
                const isLead = Boolean(ownerId && memberId && ownerId === memberId)
                return (
                  <div
                    key={memberId}
                    className="flex flex-col gap-3 border border-border-default rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-text-primary">{member.name || 'Unknown'}</div>
                        {canSeeOnlineStatus && isOnline(member) && (
                          <span className="inline-flex items-center gap-1 text-xs text-success">
                            <span className="h-2 w-2 rounded-full bg-success" />
                            Online
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-muted">{member.email || 'No email provided'}</div>
                      {isOwner && member.phone && (
                        <div className="text-sm text-text-muted">Phone: {member.phone}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isLead && <Badge variant="primary">Lead</Badge>}
                      {isOwner && !isLead && (
                        <Button
                          variant="danger"
                          size="xs"
                          className="whitespace-nowrap"
                          onClick={() => openRemoveModal(member)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

          </Card>

          {(isOwner || isTeamMember) && (project.validation?.reviews || project.status === 'validation' || project.status === 'validated') && (
            <Card className={sectionCardClass('validation')}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Validation Feedback</h2>
                  <p className="text-sm text-text-secondary">
                    {validationReviewCount}/{validationRequired} reviews · Avg {validationData.averageRating || 0}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Problem Fit {criteriaAverages.solutionFit || 0}/5 · Innovation {criteriaAverages.innovation || 0}/5 · Usefulness {criteriaAverages.usefulness || 0}/5 · Execution {criteriaAverages.executionReadiness || 0}/5
                  </p>
                </div>
                <Badge variant={validationData.validationStatus === 'passed' ? 'success' : 'default'}>
                  {validationData.validationStatus || 'pending'}
                </Badge>
              </div>

              {project.status === 'validation_failed' && validationData.lastFailureReason && (
                <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
                  {validationData.lastFailureReason}
                </div>
              )}

              {(validationData.reviews || []).length > 0 ? (
                <div className="space-y-3">
                  {validationData.reviews.map((review) => (
                    <div key={review._id} className="rounded-lg border border-border-default bg-bg-card/70 p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-medium text-text-primary">
                          {review.reviewer?.name || 'Reviewer'}
                        </div>
                        <div className="text-xs text-text-muted">Rating: {review.rating}/5</div>
                      </div>
                      <div className="text-xs text-text-muted">
                        Problem Clarity {review.criteria?.problemClarity || 0}/5 · Solution Fit {review.criteria?.solutionFit || 0}/5 · Innovation {review.criteria?.innovation || 0}/5 · Execution {review.criteria?.executionReadiness || 0}/5
                      </div>
                      <p className="text-sm text-text-secondary">{review.feedback}</p>
                      <div className="text-xs text-text-muted space-y-1">
                        {review.topStrengths && <p><span className="font-medium text-text-primary">Strengths:</span> {review.topStrengths}</p>}
                        {review.topGaps && <p><span className="font-medium text-text-primary">Gaps:</span> {review.topGaps}</p>}
                        {review.biggestRisk && <p><span className="font-medium text-text-primary">Biggest Risk:</span> {review.biggestRisk}</p>}
                        {review.next7DayAction && <p><span className="font-medium text-text-primary">7-Day Action:</span> {review.next7DayAction}</p>}
                      </div>
                      {isOwner && (
                        <div className="flex justify-end">
                          <Button
                            variant={review.helpful ? 'default' : 'secondary'}
                            size="xs"
                            onClick={() => handleMarkHelpful(review._id)}
                            disabled={review.helpful || helpfulLoading === review._id}
                          >
                            {review.helpful ? (
                              <span className="inline-flex items-center gap-2">
                                <img src={checkIcon} alt="Helpful" className="h-4 w-4" />
                                Helpful
                              </span>
                            ) : helpfulLoading === review._id ? 'Marking...' : 'Mark Helpful'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No feedback submitted yet.</p>
              )}
          {helpfulError && <p className="text-xs text-error mt-3">{helpfulError}</p>}
            </Card>
          )}

          {project.status === 'validation_failed' && (
            <Card className={sectionCardClass('validation')}>
              <h2 className="text-xl font-bold text-text-primary mb-2">Validation Rework Required</h2>
              <p className="text-sm text-text-secondary">
                This venture did not pass validation yet. Improve based on feedback and choose your next step.
              </p>
              {validationData.lastFailureReason && (
                <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
                  {validationData.lastFailureReason}
                </div>
              )}
              {isOwner ? (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={extendingTimeline}
                    onClick={handleExtendTimeline}
                  >
                    {extendingTimeline ? 'Extending...' : 'Move to Dashboard + Extend 7 Days'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={openDeleteModal}>
                    Delete Venture
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-xs text-text-muted">
                  Venture lead can either delete the venture or reopen it with a 7-day extension.
                </p>
              )}
              {extendTimelineError && <p className="mt-3 text-xs text-error">{extendTimelineError}</p>}
            </Card>
          )}

          {teamFull && isTeamMember && (
            <Card id="workspace-build-progress" className={sectionCardClass('build-progress')}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Team Workspace</h2>
                    <p className="text-sm text-text-secondary">Collaborate, share files, and ship an MVP.</p>
                    {hasExtendedTimeline && (
                      <p className="text-xs text-warning mt-1">
                        Extended timeline active (+{project.buildPhase?.extensionDaysGranted || 0} days total).
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-text-muted uppercase tracking-wide">Time Remaining</span>
                    <span className={`text-lg font-semibold ${timeExpired ? 'text-error' : 'text-primary'}`}>
                      {timeLeft || '—'}
                    </span>
                  </div>
                </div>

                <div
                  id="workspace-assets"
                  className={`rounded-xl border border-border-default bg-bg-secondary/60 p-4 space-y-3 ${
                    activeSection === 'assets' ? 'ring-1 ring-primary/30 border-primary/35' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-text-primary">Venture Files</h3>
                    <span className="text-xs text-text-muted">Upload any format</span>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="file"
                      onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                      className="w-full text-sm text-text-muted"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleFileUpload}
                      disabled={!selectedFile || uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                  {uploadError && <p className="text-xs text-error">{uploadError}</p>}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {(project.files || []).length > 0 ? (
                      project.files.map((file) => {
                        const fileKey = file._id || file.filename
                        const uploadedById = file.uploadedBy?._id || file.uploadedBy?.id
                        const canRemoveFile = Boolean(isOwner || (userId && uploadedById && uploadedById === userId))
                        const fileUrl = resolveProjectFileUrl(file)
                        return (
                          <div
                            key={fileKey}
                            className="flex flex-col gap-2 rounded-lg border border-border-default bg-bg-card/70 p-2"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <a
                                href={fileUrl}
                                className="text-sm font-medium text-primary hover:text-primary-hover break-all"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {file.originalName}
                              </a>
                              {canRemoveFile && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="text-error w-full sm:w-auto"
                                  onClick={() => handleRemoveFile(file)}
                                  disabled={removeFileId === fileKey}
                                >
                                  {removeFileId === fileKey ? 'Removing...' : 'Remove'}
                                </Button>
                              )}
                            </div>
                            <div className="text-xs text-text-muted">
                              {file.uploadedBy?.name || 'Team contributor'} · {(file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-text-muted">No files uploaded yet.</p>
                    )}
                  </div>
                  {removeFileError && <p className="text-xs text-error">{removeFileError}</p>}
                </div>

                <div
                  id="workspace-updates"
                  className={`rounded-xl border border-border-default bg-bg-secondary/50 p-4 space-y-3 ${
                    activeSection === 'updates' ? 'ring-1 ring-primary/30 border-primary/35' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-text-primary">Team Chat</h3>
                    <span className="text-xs text-text-muted">Private to team contributors</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                    {(project.messages || []).length > 0 ? (
                      (project.messages || []).map((message) => {
                        const senderName = message.sender?.name || 'Team Contributor'
                        const timestamp = message.createdAt
                          ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''
                        return (
                          <div key={message._id || `${senderName}-${timestamp}`} className="rounded-lg border border-border-default bg-bg-card/70 p-2">
                            <div className="flex items-center justify-between text-xs text-text-muted">
                              <span className="font-medium text-text-secondary">{senderName}</span>
                              <span>{timestamp}</span>
                            </div>
                            <p className="text-sm text-text-primary mt-1">{message.text}</p>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-text-muted">Start the conversation with your team.</p>
                    )}
                  </div>
                  {chatError && <p className="text-xs text-error">{chatError}</p>}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <textarea
                      rows={2}
                      value={chatMessage}
                      onChange={(event) => setChatMessage(event.target.value)}
                      placeholder={canChat ? 'Type a message...' : 'Join the team to chat.'}
                      disabled={!canChat}
                      className={`w-full resize-none px-4 py-3 rounded-xl border border-border-default bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${!canChat ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      className="disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleSendMessage}
                      disabled={!canChat || !chatMessage.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </div>

                {isOwner && (
                  <div className="rounded-xl border border-border-default bg-bg-secondary/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-text-primary">Validation Pack</h3>
                      <span className="text-xs text-text-muted">Shown to validators</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-text-secondary">Demo / Website Link</label>
                        <Input
                          value={validationLink}
                          onChange={(event) => setValidationLink(event.target.value)}
                          placeholder="https://your-mvp.com"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-secondary">Notes for validators</label>
                        <textarea
                          rows={3}
                          value={validationNotes}
                          onChange={(event) => setValidationNotes(event.target.value)}
                          placeholder="Share what to focus on during validation."
                          className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border-default bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-secondary">Share files</label>
                        {(project.files || []).length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {project.files.map((file) => {
                              const fileId = file._id || file.filename
                              const checked = sharedFileIds.includes(fileId)
                              return (
                                <label key={fileId} className="flex items-center gap-2 text-sm text-text-secondary">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSharedFile(fileId)}
                                  />
                                  <span>{file.originalName}</span>
                                </label>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted mt-2">Upload files above to share with validators.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isOwner && !timeExpired && ['building', 'completed'].includes(project.status) && (
                  <div className="flex flex-col gap-2 items-stretch sm:items-end">
                    {validationError && <p className="text-xs text-error">{validationError}</p>}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSendToValidation}
                      disabled={validating}
                    >
                      {validating ? 'Sending...' : 'Validate Venture'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {!(teamFull && isTeamMember) && (
            <>
              <Card id="workspace-build-progress" className={sectionCardClass('build-progress')}>
                <h2 className="text-xl font-bold text-text-primary mb-2">Build Progress</h2>
                <p className="text-sm text-text-secondary">
                  Build execution tools unlock once your startup team is complete and active.
                </p>
              </Card>
              <Card id="workspace-assets" className={sectionCardClass('assets')}>
                <h2 className="text-xl font-bold text-text-primary mb-2">Assets</h2>
                <p className="text-sm text-text-secondary">
                  Uploads and shared validation assets will appear here when your team workspace is active.
                </p>
              </Card>
              <Card id="workspace-updates" className={sectionCardClass('updates')}>
                <h2 className="text-xl font-bold text-text-primary mb-2">Updates</h2>
                <p className="text-sm text-text-secondary">
                  Team build updates and internal execution chat are shown in this section.
                </p>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card id="workspace-contributors" className={sectionCardClass('contributors')}>
            <h2 className="text-xl font-bold text-text-primary mb-3">Interest Queue</h2>
            {project.interestedUsers?.length > 0 ? (
              <div className="space-y-2">
                {project.interestedUsers.map((interested) => (
                  <div
                    key={interested._id}
                    className="flex flex-col gap-3 p-3 border border-border-default rounded-lg sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-medium text-text-primary">{interested.name || 'Unknown'}</div>
                      <div className="text-sm text-text-muted">{interested.email || 'No email provided'}</div>
                      {isOwner && interested.phone && (
                        <div className="text-sm text-text-muted">Phone: {interested.phone}</div>
                      )}
                    </div>
                    {isOwner ? (
                      <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center">
                        <Button
                          variant="primary"
                          size="xs"
                          className="w-full sm:w-auto whitespace-nowrap"
                          onClick={() => handleAddMember(interested._id)}
                          disabled={teamFull}
                        >
                          {teamFull ? 'Team Full' : 'Add to Team'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="w-full sm:w-auto whitespace-nowrap text-error"
                          onClick={() => handleRejectMember(interested._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="default" className="whitespace-nowrap">Earliest Interest</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No users have shown interest yet.</p>
            )}
          </Card>

          <Card id="workspace-settings" className={sectionCardClass('settings')}>
            <h2 className="text-xl font-bold text-text-primary mb-3">Workspace Settings</h2>
            <p className="text-sm text-text-secondary mb-4">
              Manage venture details, team requirements, and lifecycle controls from one place.
            </p>
            <div className="flex flex-col gap-2">
              {isOwner && (
                <>
                  <Button variant="secondary" size="sm" onClick={openEditDetails}>
                    Edit Venture Details
                  </Button>
                  <Button variant="secondary" size="sm" onClick={openEditRequirements}>
                    Edit Team Requirements
                  </Button>
                  <Button variant="danger" size="sm" onClick={openDeleteModal}>
                    Delete Venture
                  </Button>
                </>
              )}
              {!isOwner && (
                <p className="text-xs text-text-muted">Only venture lead can change workspace settings.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={closeEditRequirements} size="sm">
        <h3 className="text-lg font-semibold text-text-primary">Update Requirements</h3>
        <p className="text-sm text-text-secondary mt-2">
          Edit roles, skills, team size, or visibility without deleting the venture.
        </p>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-xs text-text-muted mb-2">Roles Needed (comma separated)</label>
            <Input
              type="text"
              value={requirementsForm.rolesNeeded}
              onChange={(e) => setRequirementsForm((prev) => ({ ...prev, rolesNeeded: e.target.value }))}
              placeholder="Example: Frontend, Backend, Designer"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-2">Skills Required (comma separated)</label>
            <Input
              type="text"
              value={requirementsForm.skillsRequired}
              onChange={(e) => setRequirementsForm((prev) => ({ ...prev, skillsRequired: e.target.value }))}
              placeholder="Example: React, Node.js, Figma"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-2">Team Size (including you)</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={requirementsForm.numberOfTeammates}
                onChange={(e) => setRequirementsForm((prev) => ({ ...prev, numberOfTeammates: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-2">Visibility</label>
              <select
                value={requirementsForm.visibility}
                onChange={(e) => setRequirementsForm((prev) => ({ ...prev, visibility: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="private">Private (Only Team)</option>
                <option value="college">College Only</option>
                <option value="global">Global</option>
              </select>
            </div>
          </div>
        </div>
        {editError && <p className="text-xs text-error mt-3">{editError}</p>}
        <div className="flex flex-col gap-2 mt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="sm" onClick={closeEditRequirements}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleRequirementsSave}
            disabled={editSaving}
          >
            {editSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      <Modal open={detailsOpen} onClose={closeEditDetails} size="sm">
        <h3 className="text-lg font-semibold text-text-primary">Update Venture Details</h3>
        <p className="text-sm text-text-secondary mt-2">
          Edit the venture title, pitch, description, tags, or execution plan.
        </p>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-xs text-text-muted mb-2">Title</label>
            <Input
              type="text"
              value={detailsForm.title}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Venture title"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-2">Short Pitch</label>
            <textarea
              value={detailsForm.shortPitch}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, shortPitch: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="One‑line pitch"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-2">Description</label>
            <textarea
              value={detailsForm.description}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Describe the venture"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-2">Tags (comma separated)</label>
            <Input
              type="text"
              value={detailsForm.tags}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="Example: Fintech, Campus, Mobile"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-2">Execution Plan</label>
            <textarea
              value={detailsForm.executionPlan}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, executionPlan: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="What will you complete in 14 days?"
            />
          </div>
        </div>
        {detailsError && <p className="text-xs text-error mt-3">{detailsError}</p>}
        <div className="flex flex-col gap-2 mt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="sm" onClick={closeEditDetails}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleDetailsSave}
            disabled={detailsSaving}
          >
            {detailsSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      <Modal open={removeOpen} onClose={closeRemoveModal} size="sm">
        <h3 className="text-lg font-semibold text-text-primary">Remove Team Contributor</h3>
        <p className="text-sm text-text-secondary mt-2">
          Are you sure you want to remove{' '}
          <span className="text-text-primary font-medium">
            {removeTarget?.name || 'this contributor'}
          </span>{' '}
          from the team? This action cannot be undone.
        </p>
        {removeError && <p className="text-xs text-error mt-3">{removeError}</p>}
        <div className="flex flex-col gap-2 mt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="sm" onClick={closeRemoveModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleRemoveMember}
            disabled={removing}
          >
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={closeDeleteModal} size="sm">
        <h3 className="text-lg font-semibold text-text-primary">Delete Venture</h3>
        <p className="text-sm text-text-secondary mt-2">
          This will permanently delete the venture and remove it for all contributors. This action cannot be undone.
        </p>
        {deleteError && <p className="text-xs text-error mt-3">{deleteError}</p>}
        <div className="flex flex-col gap-2 mt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="sm" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleDeleteProject}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
