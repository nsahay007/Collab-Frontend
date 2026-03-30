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
  markReviewHelpful,
  updateProjectRequirements,
  updateProjectDetails
} from '../features/projects/projectAPI'
import useAuth from '../hooks/useAuth'
import checkIcon from '../assets/icons/check.svg'
import { uploadsBaseUrl } from '../config/api'

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
  const [validating, setValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
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
    visibility: 'college'
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

  const loadProject = useCallback(async () => {
    try {
      const response = await fetchProject(id)
      if (response?.data) {
        setProject(response.data)
      } else {
        setError('Project not found')
      }
    } catch (err) {
      console.error('Error loading project', err)
      setError('Failed to load project')
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
    if (existingShared.length > 0) {
      setSharedFileIds(existingShared.map((file) => file._id || file.filename).filter(Boolean))
    }
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
  const canSeeOnlineStatus = Boolean(isOwner || isTeamMember)
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
      visibility: project?.visibility || 'college'
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
      setDetailsError(err?.response?.data?.message || 'Unable to update project details.')
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
      setRemoveError(err?.response?.data?.message || 'Unable to remove this member. Please try again.')
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
      setDeleteError(err?.response?.data?.message || 'Unable to delete project.')
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

  const handleSendToValidation = async () => {
    try {
      setValidating(true)
      setValidationError('')
      await sendProjectToValidation(id, {
        demoLink: validationLink,
        demoNotes: validationNotes,
        sharedFileIds
      })
      navigate('/validation')
    } catch (err) {
      console.error(err)
      setValidationError(err?.response?.data?.message || 'Unable to send project to validation.')
    } finally {
      setValidating(false)
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

  if (loading) {
    return <div>Loading project...</div>
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">{error || 'Project not found'}</h1>
        <p className="text-text-secondary max-w-md">Please go back and select another project.</p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{project.title}</h1>
          <p className="text-text-secondary">{project.description}</p>
          <div className="text-sm text-text-muted">Owner: {project.owner?.name || 'Unknown'}</div>
        </div>
        <div className="flex gap-2 items-center">
          {!isOwner && !isTeamMember && !hasInterest && (
            <Button onClick={handleInterest}>Show Interest</Button>
          )}
          {isTeamMember && <Badge variant="primary">Joined</Badge>}
          {isOwner && <Badge variant="primary">Team Lead</Badge>}
          {isOwner && (
            <Button variant="secondary" size="sm" onClick={openEditDetails}>
              Edit Details
            </Button>
          )}
          {isOwner && (
            <Button variant="danger" size="sm" onClick={openDeleteModal}>
              Delete Project
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-text-primary mb-3">Project Overview</h2>
            <p className="text-text-secondary leading-relaxed">{project.description}</p>
          </Card>

          <Card>
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
                Team size (including lead): {maxTeamMembers} · Visibility: {project.visibility || 'college'}
              </div>
            </div>
          </Card>

          <Card>
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

          {(isOwner || isTeamMember) && (project.validation?.reviews || project.status === 'validation' || project.status === 'validated') && (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Validation Feedback</h2>
                  <p className="text-sm text-text-secondary">
                    {validationReviewCount}/{validationRequired} reviews · Avg {validationData.averageRating || 0}
                  </p>
                </div>
                <Badge variant={validationData.validationStatus === 'passed' ? 'success' : 'default'}>
                  {validationData.validationStatus || 'pending'}
                </Badge>
              </div>

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
                      <p className="text-sm text-text-secondary">{review.feedback}</p>
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

          {teamFull && isTeamMember && (
            <Card>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Team Workspace</h2>
                    <p className="text-sm text-text-secondary">Collaborate, share files, and ship an MVP.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-text-muted uppercase tracking-wide">Time Remaining</span>
                    <span className={`text-lg font-semibold ${timeExpired ? 'text-error' : 'text-primary'}`}>
                      {timeLeft || '—'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border-default bg-bg-secondary/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-text-primary">Project Files</h3>
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
                      project.files.map((file) => (
                        <div
                          key={file._id || file.filename}
                          className="flex flex-col gap-1 rounded-lg border border-border-default bg-bg-card/70 p-2"
                        >
                          <a
                            href={`${uploadsBaseUrl}/uploads/${file.filename}`}
                            className="text-sm font-medium text-primary hover:text-primary-hover"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {file.originalName}
                          </a>
                          <div className="text-xs text-text-muted">
                            {file.uploadedBy?.name || 'Team member'} · {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-text-muted">No files uploaded yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border-default bg-bg-secondary/50 p-4 space-y-3">
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

                {isOwner && !timeExpired && (
                  <div className="flex flex-col gap-2 items-end">
                    {validationError && <p className="text-xs text-error">{validationError}</p>}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSendToValidation}
                      disabled={validating}
                    >
                      {validating ? 'Sending...' : 'Validate Project'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="xs"
                          className="whitespace-nowrap"
                          onClick={() => handleAddMember(interested._id)}
                          disabled={teamFull}
                        >
                          {teamFull ? 'Team Full' : 'Add to Team'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="whitespace-nowrap text-error"
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
        </div>
      </div>

      <Modal open={editOpen} onClose={closeEditRequirements} size="sm">
        <h3 className="text-lg font-semibold text-text-primary">Update Requirements</h3>
        <p className="text-sm text-text-secondary mt-2">
          Edit roles, skills, team size, or visibility without deleting the project.
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
        <h3 className="text-lg font-semibold text-text-primary">Update Project Details</h3>
        <p className="text-sm text-text-secondary mt-2">
          Edit the project title, pitch, description, tags, or execution plan.
        </p>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-xs text-text-muted mb-2">Title</label>
            <Input
              type="text"
              value={detailsForm.title}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Project title"
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
              placeholder="Describe the project"
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
        <h3 className="text-lg font-semibold text-text-primary">Remove Team Member</h3>
        <p className="text-sm text-text-secondary mt-2">
          Are you sure you want to remove{' '}
          <span className="text-text-primary font-medium">
            {removeTarget?.name || 'this member'}
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
        <h3 className="text-lg font-semibold text-text-primary">Delete Project</h3>
        <p className="text-sm text-text-secondary mt-2">
          This will permanently delete the project and remove it for all members. This action cannot be undone.
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
