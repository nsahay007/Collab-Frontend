import React, { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import CheckDraw from '../components/common/CheckDraw'
import { ProjectDetailSkeleton } from '../components/common/Skeleton'
import { useMotionToast } from '../components/common/MotionToast'
import {
  fetchProject,
  removeTeamMember,
  addProjectMessage,
  deleteProject,
  uploadProjectFile,
  sendProjectToValidation,
  extendValidationTimeline,
  updateProjectRequirements,
  updateProjectDetails,
  deleteProjectFile,
  updateValidationWorkspace
} from '../features/projects/projectAPI'
import useAuth from '../hooks/useAuth'
import { uploadsBaseUrl } from '../config/api'
import VentureExecutionPanel from '../features/ventures/components/VentureExecutionPanel'
import IncubationReadinessPanel from '../features/ventures/components/IncubationReadinessPanel'
import { applyContinuationAction, fetchIncubationPacket } from '../features/ventures/ventureAPI'
import {
  LINEAR_LIFECYCLE,
  getLifecycleLabel,
  getLifecycleProgress,
  getLifecyclePrompt,
  getLifecycleQuestions,
  getLifecycleNextAction,
  getLifecycleVariant,
  getNextLifecycleLabel,
  normalizeLifecycleStage
} from '../utils/ventureLifecycle'

const WORKSPACE_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'build-progress', label: 'Build Progress' },
  { id: 'validation', label: 'Validation' },
  { id: 'readiness', label: 'Readiness' },
  { id: 'assets', label: 'Assets' },
  { id: 'team', label: 'Team' },
  { id: 'settings', label: 'Settings' }
]

const downloadTextFile = (filename, content, type = 'application/json') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useMotionToast()
  const [project, setProject] = useState(null)
  const [flashedTaskId, setFlashedTaskId] = useState(null)
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
  const [validationLink, setValidationLink] = useState('')
  const [validationNotes, setValidationNotes] = useState('')
  const [sharedFileIds, setSharedFileIds] = useState([])
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
    whoSpokenTo: '',
    repeatedProblems: '',
    surprisingInsights: '',
    useOrPaySignal: '',
    feedbackChanges: '',
    confidenceScore: 0,
    tasks: [],
    evidence: []
  })
  const [workspaceTaskInput, setWorkspaceTaskInput] = useState('')
  const [workspaceEvidenceInput, setWorkspaceEvidenceInput] = useState({
    kind: 'screenshot',
    title: '',
    summary: '',
    link: ''
  })
  const [workspaceSaving, setWorkspaceSaving] = useState(false)
  const [workspaceError, setWorkspaceError] = useState('')
  const [workspaceSuccess, setWorkspaceSuccess] = useState('')
  const [stageSaving, setStageSaving] = useState(false)
  const [stageError, setStageError] = useState('')
  const [selectedStage, setSelectedStage] = useState(null)

  const loadProject = useCallback(async () => {
    try {
      const response = await fetchProject(id)
      const workspace = response?.data || response
      if (workspace?._id || workspace?.id) {
        setProject(workspace)
        return workspace
      }
      setError('Startup workspace not found')
      return null
    } catch (err) {
      console.error('Error loading startup workspace', err)
      setError('Failed to load startup workspace')
      return null
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
      whoSpokenTo: workspace.whoSpokenTo || '',
      repeatedProblems: workspace.repeatedProblems || '',
      surprisingInsights: workspace.surprisingInsights || '',
      useOrPaySignal: workspace.useOrPaySignal || '',
      feedbackChanges: workspace.feedbackChanges || '',
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
  const isTeamMember = project?.teamMembers?.some((u) => (u._id === userId || u.id === userId))
  const canChat = Boolean(isTeamMember)
  const maxTeamMembers = project?.numberOfTeammates || 1
  const teamCount = project?.teamMembers?.length || 0
  const validationData = project?.validation || {}
  const lifecycleStage = normalizeLifecycleStage(project?.lifecycleStage || project?.status || project?.phase)
  const lifecycleProgress = getLifecycleProgress(lifecycleStage)
  const lifecycleIndex = LINEAR_LIFECYCLE.indexOf(lifecycleStage)
  const canSubmitForValidation = isOwner
    && ['building', 'mvp'].includes(lifecycleStage)
    && !['in_review', 'passed'].includes(validationData.validationStatus)
  const needsValidationRework = validationData.validationStatus === 'failed' || lifecycleStage === 'pivoted'
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
  const activeGuideStage = normalizeLifecycleStage(selectedStage || lifecycleStage)
  const activeGuideIndex = LINEAR_LIFECYCLE.indexOf(activeGuideStage)
  const stageQuestions = getLifecycleQuestions(activeGuideStage)
  const stageNextAction = getLifecycleNextAction(activeGuideStage)
  const stageTargetSection = {
    idea: 'overview',
    planning: 'milestones',
    building: 'build-progress',
    mvp: 'build-progress',
    validation: 'validation',
    incubation_ready: 'readiness',
    pivoted: 'roadmap',
    archived: 'overview'
  }[activeGuideStage] || 'overview'
  const editableStages = LINEAR_LIFECYCLE.filter((stage, index) => index <= Math.max(0, lifecycleIndex))
  const primaryStageAction = {
    idea: { label: 'Continue to Planning', action: 'continue_planning' },
    planning: { label: 'Start Building', action: 'continue_building' },
    building: { label: 'Move to MVP', action: 'extend_mvp' },
    mvp: { label: 'Start Validation', action: 'start_validation' },
    validation: { label: 'Prepare for Incubation', action: 'prepare_incubation' },
    incubation_ready: { label: 'Download Incubation Package', action: 'download_packet' },
    pivoted: { label: 'Restart Planning', action: 'continue_planning' }
  }[lifecycleStage] || { label: 'Continue', action: 'continue_building' }
  const canUseStageFlow = Boolean(isOwner || isTeamMember)
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
      setDetailsError(err?.response?.data?.message || 'Unable to update startup details.')
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
        if (nextCompleted) {
          setFlashedTaskId(taskId)
          window.setTimeout(() => setFlashedTaskId(null), 1200)
        }
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
      kind: 'screenshot',
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
        whoSpokenTo: workspaceForm.whoSpokenTo,
        repeatedProblems: workspaceForm.repeatedProblems,
        surprisingInsights: workspaceForm.surprisingInsights,
        useOrPaySignal: workspaceForm.useOrPaySignal,
        feedbackChanges: workspaceForm.feedbackChanges,
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
      setRemoveError(err?.response?.data?.message || 'Unable to remove this team member. Please try again.')
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
      setDeleteError(err?.response?.data?.message || 'Unable to delete startup workspace.')
    } finally {
      setDeleting(false)
    }
  }

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
      setWorkspaceSuccess('Self-conducted validation started inside this workspace.')
    } catch (err) {
      console.error(err)
      setValidationError(err?.response?.data?.message || 'Unable to start validation.')
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

  const handlePrimaryStageAction = async () => {
    if (!canUseStageFlow) return
    const prevStage = normalizeLifecycleStage(project?.lifecycleStage || project?.status || project?.phase)
    try {
      setStageSaving(true)
      setStageError('')
      const note = chatMessage.trim()
      if (note) {
        await addProjectMessage(id, userId, note)
        setChatMessage('')
      }

      if (primaryStageAction.action === 'download_packet') {
        const data = await fetchIncubationPacket(id)
        const blob = new Blob([JSON.stringify(data?.packet || data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${project.title || 'startup'}-incubation-package.json`
        link.click()
        URL.revokeObjectURL(url)
      } else if (primaryStageAction.action === 'start_validation') {
        await sendProjectToValidation(id, {
          demoLink: validationLink,
          demoNotes: note || 'MVP is ready for self-conducted validation.',
          sharedFileIds
        })
      } else {
        await applyContinuationAction(id, {
          action: primaryStageAction.action,
          note: note || `Moved from ${getLifecycleLabel(lifecycleStage)} using the guided pipeline.`
        })
      }

      const updated = await loadProject()
      const nextStage = normalizeLifecycleStage(updated?.lifecycleStage || updated?.status || updated?.phase)
      if (nextStage && prevStage && nextStage !== prevStage) {
        showToast(`Stage advanced to ${getLifecycleLabel(nextStage)}`, 'success')
      } else if (primaryStageAction.action === 'download_packet') {
        showToast('Incubation package downloaded', 'success')
      }
    } catch (err) {
      console.error(err)
      setStageError(err?.response?.data?.message || 'Could not complete this step.')
    } finally {
      setStageSaving(false)
    }
  }

  const handleSaveStageProgress = async () => {
    if (!canUseStageFlow) return
    try {
      setStageSaving(true)
      setStageError('')
      const note = chatMessage.trim() || `Updated ${getLifecycleLabel(activeGuideStage)} answers.`
      await addProjectMessage(id, userId, `[${getLifecycleLabel(activeGuideStage)}] ${note}`)
      setChatMessage('')
      await loadProject()
    } catch (err) {
      console.error(err)
      setStageError(err?.response?.data?.message || 'Could not save progress.')
    } finally {
      setStageSaving(false)
    }
  }

  const handleDownloadIncubationPackage = async () => {
    try {
      setStageSaving(true)
      setStageError('')
      const data = await fetchIncubationPacket(id)
      downloadTextFile(`${project.title || 'startup'}-incubation-package.json`, JSON.stringify({
        folders: {
          '01_Idea': getLifecycleQuestions('idea'),
          '02_Planning': getLifecycleQuestions('planning'),
          '03_Building': getLifecycleQuestions('building'),
          '04_MVP': getLifecycleQuestions('mvp'),
          '05_Validation': getLifecycleQuestions('validation'),
          '06_Incubation_Ready': getLifecycleQuestions('incubation_ready')
        },
        startupSummary: data?.packet || data,
        uploadedFiles: project.files || [],
        notes: project.messages || []
      }, null, 2))
    } catch (err) {
      console.error(err)
      setStageError(err?.response?.data?.message || 'Could not export package.')
    } finally {
      setStageSaving(false)
    }
  }

  const handleDownloadCertificates = () => {
    const members = project.teamMembers || []
    downloadTextFile(`${project.title || 'startup'}-team-certificates.json`, JSON.stringify(members.map((member) => ({
      startupName: project.title,
      memberName: member.name || 'Team Member',
      role: member._id === ownerId ? 'Startup Lead' : 'Team Member',
      contributionSummary: 'Contributed to startup execution and incubation readiness.',
      completion: 'Incubation Ready',
      completionDate: new Date().toISOString().slice(0, 10)
    })), null, 2))
  }

  useEffect(() => {
    if (!canChat) return undefined
    const interval = setInterval(() => {
      loadProject()
    }, 8000)
    return () => clearInterval(interval)
  }, [canChat, loadProject])

  const sectionCardClass = (sectionId) => (
    activeSection === sectionId ? 'border-primary/35 ring-1 ring-primary/30' : ''
  )

  if (loading) {
    return <ProjectDetailSkeleton />
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">{error || 'Startup workspace not found'}</h1>
        <p className="text-text-secondary max-w-md">Please go back and select another startup workspace.</p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  if (lifecycleStage === 'incubation_ready' && !selectedStage) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card hover={false} className="border-success/30 text-center">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-xs uppercase tracking-wide text-success mb-2">Startup Status</p>
          <h1 className="text-3xl font-bold text-text-primary">Incubation Ready</h1>
          <p className="mt-3 text-text-secondary">
            {project.title} is complete for pre-incubation. Download the final package, get team certificates, or reopen the workspace to improve it later.
          </p>
        </Card>
        <Card hover={false}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="primary" onClick={handleDownloadIncubationPackage} disabled={stageSaving}>
              Download Startup Package
            </Button>
            <Button variant="secondary" onClick={handleDownloadCertificates}>
              Download Team Certificates
            </Button>
            <Button variant="secondary" onClick={() => setSelectedStage('validation')}>
              Reopen Workspace
            </Button>
          </div>
          {stageError && <p className="mt-3 text-xs text-error">{stageError}</p>}
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">Startup Guided Pipeline</p>
          <h1 className="text-3xl font-bold text-text-primary">{project.title}</h1>
          <p className="mt-2 text-text-secondary">{project.shortPitch || project.description}</p>
        </div>
        <Link to="/dashboard">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto">Dashboard</Button>
        </Link>
      </div>

      <Card hover={false} className="border-primary/25">
        <div className="mb-5 flex flex-wrap gap-2">
          {editableStages.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setSelectedStage(stage)}
              className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                activeGuideStage === stage
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border-default bg-bg-card text-text-secondary hover:border-primary/40 hover:text-text-primary'
              }`}
            >
              {getLifecycleLabel(stage)}
            </button>
          ))}
          {selectedStage && selectedStage !== lifecycleStage && (
            <button type="button" onClick={() => setSelectedStage(null)} className="rounded-full px-3 py-2 text-xs font-medium text-text-muted hover:text-text-primary">
              Back to current stage
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant={getLifecycleVariant(activeGuideStage)}>
              {activeGuideStage === lifecycleStage ? 'Current' : 'Editing'}: {getLifecycleLabel(activeGuideStage)}
            </Badge>
            <h2 className="mt-3 text-2xl font-bold text-text-primary">What should we do now?</h2>
            <p className="mt-2 text-sm text-text-secondary">{stageNextAction}</p>
          </div>
          <div className="text-sm text-text-muted">{lifecycleProgress}% complete</div>
        </div>
        <div className="mt-5 progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={false}
            animate={{ width: `${Math.max(0, Math.min(100, lifecycleProgress))}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary">Edit answers</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stageQuestions.map((question) => (
            <div key={question} className="rounded-xl bg-bg-secondary/70 p-4 text-sm text-text-primary">
              {question}
            </div>
          ))}
        </div>
        <textarea
          rows={6}
          value={chatMessage}
          onChange={(event) => setChatMessage(event.target.value)}
          disabled={!canUseStageFlow}
          placeholder="Write your team’s answers or progress update here. Keep it simple and practical."
          className="mt-5 w-full resize-none rounded-2xl border border-border-default bg-bg-card px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </Card>

      {(lifecycleStage === 'validation' || lifecycleStage === 'incubation_ready') && (
        <Card hover={false}>
          <h2 className="text-xl font-semibold text-text-primary">What would you like to improve next?</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Improve MVP', 'mvp'],
              ['Re-run Validation', 'validation'],
              ['Update Planning', 'planning'],
              ['Add New Features', 'building'],
              ['Continue Building', 'building'],
              ['Prepare Incubation Documents', 'incubation_ready']
            ].map(([label, stage]) => (
              <Button key={label} variant="secondary" size="sm" onClick={() => setSelectedStage(stage)}>
                {label}
              </Button>
            ))}
            <Button variant="primary" size="sm" onClick={handleDownloadIncubationPackage} disabled={stageSaving}>
              Export Startup Package
            </Button>
          </div>
          {lifecycleStage === 'incubation_ready' && (
            <p className="mt-3 text-sm text-text-secondary">
              Your startup is incubation-ready, but you can continue improving the idea, MVP, validation, and documents anytime.
            </p>
          )}
        </Card>
      )}

      {activeGuideStage !== 'idea' && activeGuideStage !== 'archived' && (
        <Card hover={false}>
          <h2 className="text-xl font-semibold text-text-primary">Upload proof or evidence</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Add screenshots, sketches, repo links as files, prototype demos, interview notes, PDFs, or validation evidence.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              className="w-full rounded-xl border border-border-default bg-bg-card px-3 py-2 text-sm text-text-secondary"
            />
            <Button
              variant="secondary"
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading || !canUseStageFlow}
              className="w-full sm:w-auto"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          {uploadError && <p className="mt-2 text-xs text-error">{uploadError}</p>}
          {(project.files || []).length > 0 && (
            <div className="mt-4 space-y-2">
              {(project.files || []).slice(0, 4).map((file) => (
                <div key={file._id || file.filename} className="rounded-xl bg-bg-secondary/60 px-3 py-2 text-sm text-text-secondary">
                  {file.originalName || file.filename}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card hover={false} className="bg-primary/5 border-primary/25">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Next step</h2>
            <p className="mt-1 text-sm text-text-secondary">Save progress, continue later, return to earlier stages, or move forward when ready.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={handleSaveStageProgress} disabled={stageSaving || !canUseStageFlow}>Save Progress</Button>
            <Link to="/dashboard"><Button variant="secondary" className="w-full sm:w-auto">Continue Later</Button></Link>
            {activeGuideIndex > 0 && <Button variant="secondary" onClick={() => setSelectedStage(LINEAR_LIFECYCLE[activeGuideIndex - 1])}>Return Previous</Button>}
            <Button
              variant="primary"
              onClick={activeGuideStage !== lifecycleStage ? () => setSelectedStage(null) : activeGuideStage === 'incubation_ready' ? handleDownloadIncubationPackage : handlePrimaryStageAction}
              disabled={stageSaving || !canUseStageFlow || lifecycleStage === 'archived'}
            >
              {stageSaving ? 'Working...' : activeGuideStage !== lifecycleStage ? 'Return To Current Stage' : activeGuideStage === 'incubation_ready' ? 'Download Incubation Package' : primaryStageAction.label}
            </Button>
          </div>
        </div>
        {stageError && <p className="mt-3 text-xs text-error">{stageError}</p>}
        {!canUseStageFlow && <p className="mt-3 text-xs text-text-muted">Only startup team members can update this guided pipeline.</p>}
      </Card>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{project.title}</h1>
          <p className="text-text-secondary">{project.description}</p>
          <div className="text-sm text-text-muted">Owner: {project.owner?.name || 'Unknown'}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={getLifecycleVariant(lifecycleStage)}>
              {getLifecycleLabel(lifecycleStage)}
            </Badge>
            <Badge variant="default">
              Next: {getNextLifecycleLabel(lifecycleStage)}
            </Badge>
            {hasExtendedTimeline && (
              <Badge variant="accent">
                Extended Timeline{extensionCount > 0 ? ` x${extensionCount}` : ''}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {!isOwner && !isTeamMember && (
            <Badge variant="accent">Private team workspace</Badge>
          )}
          {isTeamMember && <Badge variant="primary">Team Member</Badge>}
          {isOwner && <Badge variant="primary">Team Lead</Badge>}
          {isOwner && (
            <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={openEditDetails}>
              Edit Details
            </Button>
          )}
          {isOwner && (
            <Button variant="danger" size="sm" className="w-full sm:w-auto" onClick={openDeleteModal}>
              Delete Startup
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4" hover={false}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Startup Workspace</h2>
            <p className="text-xs text-text-muted">Your guided startup workspace: planning, building, validation, and incubation readiness in one place.</p>
          </div>
          <Badge variant="default">Current: {activeSection.replace(/-/g, ' ')}</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {WORKSPACE_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => jumpToSection(section.id)}
              className={`relative rounded-lg border px-3 py-2 text-xs font-medium text-left transition ${
                activeSection === section.id
                  ? 'border-primary text-primary'
                  : 'border-border-default bg-bg-card text-text-secondary hover:border-primary/35 hover:text-text-primary'
              }`}
            >
              {activeSection === section.id && (
                <motion.span
                  layoutId="workspace-section-pill"
                  className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{section.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-primary/30 bg-primary/5" hover={false}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary mb-2">Guided Pipeline Step</p>
                <h2 className="text-2xl font-bold text-text-primary">{getLifecycleLabel(lifecycleStage)}: what should we do next?</h2>
                <p className="mt-2 text-sm text-text-secondary">{stageNextAction}</p>
              </div>
              <Button size="sm" className="w-full lg:w-auto" onClick={() => jumpToSection(stageTargetSection)}>
                Go to next step
              </Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {stageQuestions.map((question) => (
                <div key={question} className="rounded-xl border border-border-default bg-bg-card px-4 py-3 text-sm text-text-primary">
                  {question}
                </div>
              ))}
            </div>
          </Card>

          <Card id="workspace-overview" className={sectionCardClass('overview')}>
            <h2 className="text-xl font-bold text-text-primary mb-3">Startup Overview</h2>
            <p className="text-text-secondary leading-relaxed">{project.description}</p>
          </Card>

          <Card className={sectionCardClass('overview')}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-text-primary">Team Setup</h2>
              {isOwner && (
                <Button variant="secondary" size="sm" onClick={openEditRequirements}>
                  Edit Team Setup
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-text-primary mb-2">Current Responsibilities</div>
                <div className="flex flex-wrap gap-2">
                  {(project.rolesNeeded || []).length ? (
                    project.rolesNeeded.map((role) => (
                      <Badge variant="default" key={role}>{role}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted">No roles listed yet</span>
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
              <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
                Find Team Members is coming soon. For launch, Collab supports existing student teams and private workspace execution.
              </div>
              <div className="text-xs text-text-muted">
                Team size (including lead): {maxTeamMembers} · Workspace visibility: {visibilityLabel(project.visibility || 'private')}
              </div>
            </div>
          </Card>

          <Card id="workspace-milestones" className={sectionCardClass('milestones')}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-text-primary">Lifecycle Milestones</h2>
              <Badge variant={getLifecycleVariant(lifecycleStage)}>{getLifecycleLabel(lifecycleStage)}</Badge>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              {getLifecyclePrompt(lifecycleStage)}
            </p>
            <div className="progress-bar mb-4">
              <motion.div
                className="progress-bar-fill"
                initial={false}
                animate={{ width: `${Math.max(0, Math.min(100, lifecycleProgress))}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {LINEAR_LIFECYCLE.map((stage) => {
                const stageIndex = LINEAR_LIFECYCLE.indexOf(stage)
                const completed = lifecycleIndex >= 0 && stageIndex < lifecycleIndex
                const active = stage === lifecycleStage

                return (
                  <div
                    key={stage}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : completed
                          ? 'border-success/30 bg-success/10 text-success'
                        : 'border-border-default bg-bg-card text-text-muted'
                    }`}
                  >
                    {completed ? 'Complete' : active ? 'Current' : 'Next'}: {getLifecycleLabel(stage)}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card id="workspace-roadmap" className={sectionCardClass('roadmap')}>
            <h2 className="text-xl font-bold text-text-primary mb-2">Roadmap</h2>
            <p className="text-sm text-text-secondary mb-4">
              Idea to planning, building, MVP, self-conducted validation, and incubation readiness.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {LINEAR_LIFECYCLE.map((stage, index) => (
                <div
                  key={stage}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-card px-3 py-2 text-xs text-text-secondary"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
                    {index + 1}
                  </span>
                  {getLifecycleLabel(stage)}
                </div>
              ))}
            </div>
          </Card>

          <VentureExecutionPanel
            project={project}
            isContributor={Boolean(isOwner || isTeamMember)}
            onProjectRefresh={loadProject}
          />

          <Card id="workspace-validation" className={sectionCardClass('validation')}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Validation</h2>
                <p className="text-sm text-text-secondary">
                  Self-conducted validation for your team: surveys, interviews, testing, feedback, and evidence.
                </p>
              </div>
              <Badge variant="default">{validationProgress}% confidence</Badge>
            </div>

            <div className="progress-bar mb-4">
              <div
                className="progress-bar-fill"
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

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Guided Validation Questions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PromptTextarea
                      label="Who did you speak to?"
                      value={workspaceForm.whoSpokenTo}
                      onChange={(value) => setWorkspaceForm((prev) => ({ ...prev, whoSpokenTo: value }))}
                      placeholder="Example: 12 hostel students, 3 canteen operators, 2 faculty mentors"
                    />
                    <PromptTextarea
                      label="What repeated problems appeared?"
                      value={workspaceForm.repeatedProblems}
                      onChange={(value) => setWorkspaceForm((prev) => ({ ...prev, repeatedProblems: value }))}
                      placeholder="What pain came up again and again?"
                    />
                    <PromptTextarea
                      label="What surprised you?"
                      value={workspaceForm.surprisingInsights}
                      onChange={(value) => setWorkspaceForm((prev) => ({ ...prev, surprisingInsights: value }))}
                      placeholder="What did feedback reveal that your team did not expect?"
                    />
                    <PromptTextarea
                      label="Would users actually use or pay for this?"
                      value={workspaceForm.useOrPaySignal}
                      onChange={(value) => setWorkspaceForm((prev) => ({ ...prev, useOrPaySignal: value }))}
                      placeholder="Capture usage intent, payment intent, or adoption signal."
                    />
                    <div className="md:col-span-2">
                      <PromptTextarea
                        label="What changed after feedback?"
                        value={workspaceForm.feedbackChanges}
                        onChange={(value) => setWorkspaceForm((prev) => ({ ...prev, feedbackChanges: value }))}
                        placeholder="What did the team change in the problem, feature scope, MVP, or roadmap?"
                      />
                    </div>
                  </div>
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
                        <div
                          key={task.taskId}
                          className={`rounded-lg border border-border-default bg-bg-card p-2 flex items-start gap-2 ${
                            flashedTaskId === task.taskId ? 'animate-status-flash border-success/30' : ''
                          }`}
                        >
                          <div className="mt-0.5 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => toggleValidationTask(task.taskId)}
                            />
                            {task.status === 'completed' && <CheckDraw className="h-3.5 w-3.5" />}
                          </div>
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
                        <option value="screenshot">Screenshot</option>
                        <option value="survey_pdf">Survey PDF</option>
                        <option value="interview_notes">Interview Notes</option>
                        <option value="feedback_form">Feedback Form</option>
                        <option value="recording">Recording</option>
                        <option value="testing_proof">Testing Proof</option>
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
                        placeholder="Link to uploaded screenshot, PDF, notes, recording, or testing proof"
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
                    {workspaceSaving ? 'Saving...' : 'Save Validation Evidence'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">{workspaceForm.problemStatement || 'Problem statement not shared yet.'}</p>
                <p className="text-sm text-text-secondary">{workspaceForm.targetUsers || 'Target users not shared yet.'}</p>
                <p className="text-xs text-text-muted">Only startup team members can edit validation evidence.</p>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-border-default bg-bg-secondary/30 p-3">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Validation Evidence Timeline</h3>
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

          <IncubationReadinessPanel
            project={project}
            isTeamMember={Boolean(isOwner || isTeamMember)}
          />

          <Card id="workspace-team" className={sectionCardClass('team')}>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              Team Members ({teamCount}/{maxTeamMembers})
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

          {needsValidationRework && (
            <Card className={sectionCardClass('validation')}>
              <h2 className="text-xl font-bold text-text-primary mb-2">Validation Rework Required</h2>
              <p className="text-sm text-text-secondary">
                This startup is not incubation-ready yet. Improve based on feedback and choose the next build step.
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
                    {extendingTimeline ? 'Reopening...' : 'Reopen Build Work'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={openDeleteModal}>
                    Delete Startup
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-xs text-text-muted">
                  Startup lead can either archive the workspace or reopen focused build work.
                </p>
              )}
              {extendTimelineError && <p className="mt-3 text-xs text-error">{extendTimelineError}</p>}
            </Card>
          )}

          {(isOwner || isTeamMember) && (
            <Card id="workspace-build-progress" className={sectionCardClass('build-progress')}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Build Progress</h2>
                    <p className="text-sm text-text-secondary">Upload progress, share assets, summarize MVP work, and keep the team moving.</p>
                    {hasExtendedTimeline && (
                      <p className="text-xs text-warning mt-1">
                        Focused rework active after validation feedback.
                      </p>
                    )}
                  </div>
                  <Badge variant={getLifecycleVariant(lifecycleStage)}>{getLifecycleLabel(lifecycleStage)}</Badge>
                </div>

                <div
                  id="workspace-assets"
                  className={`rounded-xl border border-border-default bg-bg-secondary/60 p-4 space-y-3 ${
                    activeSection === 'assets' ? 'ring-1 ring-primary/30 border-primary/35' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-text-primary">Startup Assets</h3>
                    <span className="text-xs text-text-muted">Prototype, evidence, reports</span>
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
                              {file.uploadedBy?.name || 'Team member'} · {(file.size / 1024).toFixed(1)} KB
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
                    <span className="text-xs text-text-muted">Private to team members</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                    {(project.messages || []).length > 0 ? (
                      (project.messages || []).map((message) => {
                        const senderName = message.sender?.name || 'Team Member'
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
                      placeholder={canChat ? 'What did the team decide, build, or unblock?' : 'Only team members can post updates.'}
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
                      <h3 className="text-sm font-semibold text-text-primary">MVP & Validation Summary</h3>
                      <span className="text-xs text-text-muted">Stored in readiness packet</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-text-secondary">Prototype / MVP Link</label>
                        <Input
                          value={validationLink}
                          onChange={(event) => setValidationLink(event.target.value)}
                          placeholder="https://your-mvp.com"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-secondary">Guided validation notes</label>
                        <textarea
                          rows={3}
                          value={validationNotes}
                          onChange={(event) => setValidationNotes(event.target.value)}
                          placeholder="What did your team build? What should be tested? What user feedback matters most?"
                          className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border-default bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-secondary">Include files in validation evidence</label>
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
                          <p className="text-xs text-text-muted mt-2">Upload files above to include screenshots, PDFs, recordings, or testing proof.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {canSubmitForValidation && (
                  <div className="flex flex-col gap-2 items-stretch sm:items-end">
                    {validationError && <p className="text-xs text-error">{validationError}</p>}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSendToValidation}
                      disabled={validating}
                    >
                      {validating ? 'Starting...' : 'Start Self-Conducted Validation'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {!(isOwner || isTeamMember) && (
            <>
              <Card id="workspace-build-progress" className={sectionCardClass('build-progress')}>
                <h2 className="text-xl font-bold text-text-primary mb-2">Build Progress</h2>
                <p className="text-sm text-text-secondary">
                  Build execution tools are private to the startup team.
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
                  Team build updates and internal execution notes are shown in this section.
                </p>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card hover={false}>
            <h2 className="text-xl font-bold text-text-primary mb-3">Find Team Members</h2>
            <Badge variant="accent">Coming Soon</Badge>
            <p className="mt-3 text-sm text-text-secondary">
              Public team matching is intentionally paused for launch. Use this workspace with your existing student team and keep role gaps documented in Team Setup.
            </p>
          </Card>

          <Card id="workspace-settings" className={sectionCardClass('settings')}>
            <h2 className="text-xl font-bold text-text-primary mb-3">Workspace Settings</h2>
            <p className="text-sm text-text-secondary mb-4">
              Manage startup details, team setup, and pipeline controls from one place.
            </p>
            <div className="flex flex-col gap-2">
              {isOwner && (
                <>
                  <Button variant="secondary" size="sm" onClick={openEditDetails}>
                    Edit Startup Details
                  </Button>
                  <Button variant="secondary" size="sm" onClick={openEditRequirements}>
                    Edit Team Requirements
                  </Button>
                  <Button variant="danger" size="sm" onClick={openDeleteModal}>
                    Delete Startup
                  </Button>
                </>
              )}
              {!isOwner && (
                <p className="text-xs text-text-muted">Only the startup lead can change workspace settings.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={closeEditRequirements} size="sm">
        <h3 className="text-lg font-semibold text-text-primary">Update Requirements</h3>
        <p className="text-sm text-text-secondary mt-2">
          Edit roles, skills, team size, or visibility without deleting the startup workspace.
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
        <h3 className="text-lg font-semibold text-text-primary">Update Startup Details</h3>
        <p className="text-sm text-text-secondary mt-2">
          Edit the startup name, pitch, description, tags, or execution plan.
        </p>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-xs text-text-muted mb-2">Title</label>
            <Input
              type="text"
              value={detailsForm.title}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Startup name"
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
              placeholder="Describe the startup"
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
              placeholder="What is the next execution milestone?"
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
        <h3 className="text-lg font-semibold text-text-primary">Remove Team Member</h3>
        <p className="text-sm text-text-secondary mt-2">
          Are you sure you want to remove{' '}
          <span className="text-text-primary font-medium">
            {removeTarget?.name || 'this team member'}
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
        <h3 className="text-lg font-semibold text-text-primary">Delete Startup Workspace</h3>
        <p className="text-sm text-text-secondary mt-2">
          This will permanently delete the startup workspace and remove it for all team members. This action cannot be undone.
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

function PromptTextarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full resize-none px-3 py-2 rounded-lg border border-border-default bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </label>
  )
}
