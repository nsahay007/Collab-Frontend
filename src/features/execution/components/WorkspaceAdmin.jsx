import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import useAuth from '../../../hooks/useAuth'
import {
  updateProjectDetails,
  updateProjectRequirements,
  removeTeamMember,
  deleteProject,
  respondToTeamApplication,
} from '../../projects/projectAPI'
import { VentureJourneyTimeline, WorkspaceTrustCard } from '../../../components/trust/WorkspaceTrustPanel'

function normalizeList(value) {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function WorkspaceAdmin({ project, projectId, onRefresh, milestones = [], logs = [] }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?._id || user?.id
  const ownerId = project?.owner?._id || project?.owner?.id || project?.owner
  const isOwner = Boolean(userId && ownerId && String(userId) === String(ownerId))

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [requirementsOpen, setRequirementsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [detailsForm, setDetailsForm] = useState({
    title: '',
    shortPitch: '',
    description: '',
    tags: '',
    executionPlan: '',
  })

  const [requirementsForm, setRequirementsForm] = useState({
    rolesNeeded: '',
    skillsRequired: '',
    numberOfTeammates: 1,
    visibility: 'private',
    lookingForTeammates: false,
  })

  const openDetails = () => {
    setError('')
    setDetailsForm({
      title: project?.title || '',
      shortPitch: project?.shortPitch || '',
      description: project?.description || '',
      tags: (project?.tags || []).join(', '),
      executionPlan: project?.executionPlan || '',
    })
    setDetailsOpen(true)
  }

  const openRequirements = () => {
    setError('')
    setRequirementsForm({
      rolesNeeded: (project?.rolesNeeded || []).join(', '),
      skillsRequired: (project?.skillsRequired || []).join(', '),
      numberOfTeammates: project?.numberOfTeammates || 1,
      visibility: project?.visibility || 'private',
      lookingForTeammates: Boolean(project?.lookingForTeammates),
    })
    setRequirementsOpen(true)
  }

  const saveDetails = async () => {
    setSaving(true)
    setError('')
    try {
      await updateProjectDetails(projectId, {
        title: detailsForm.title,
        shortPitch: detailsForm.shortPitch,
        description: detailsForm.description,
        tags: normalizeList(detailsForm.tags),
        executionPlan: detailsForm.executionPlan,
      })
      setDetailsOpen(false)
      onRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save details.')
    } finally {
      setSaving(false)
    }
  }

  const saveRequirements = async () => {
    setSaving(true)
    setError('')
    try {
      await updateProjectRequirements(projectId, {
        rolesNeeded: normalizeList(requirementsForm.rolesNeeded),
        skillsRequired: normalizeList(requirementsForm.skillsRequired),
        numberOfTeammates: parseInt(requirementsForm.numberOfTeammates, 10) || 1,
        visibility: requirementsForm.visibility,
        lookingForTeammates: requirementsForm.lookingForTeammates,
      })
      setRequirementsOpen(false)
      onRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save team settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleApplication = async (applicationId, action) => {
    setSaving(true)
    setError('')
    try {
      await respondToTeamApplication(projectId, applicationId, action)
      onRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update application.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    setError('')
    try {
      await deleteProject(projectId)
      navigate('/build')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete workspace.')
      setSaving(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!removeTarget) return
    const memberId = removeTarget._id || removeTarget.id
    setSaving(true)
    setError('')
    try {
      await removeTeamMember(projectId, userId, memberId)
      setRemoveOpen(false)
      setRemoveTarget(null)
      onRefresh?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not remove member.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOwner) return null

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={openDetails}>
          Settings
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          Delete
        </Button>
      </div>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} size="lg">
        <h3 className="text-lg font-semibold text-text-primary">Workspace settings</h3>
        <p className="text-sm text-text-secondary mt-1">Team, visibility, and venture metadata.</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-text-primary">Title</span>
            <input
              className="pipeline-input w-full mt-1"
              value={detailsForm.title}
              onChange={(e) => setDetailsForm((p) => ({ ...p, title: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-text-primary">Short pitch</span>
            <input
              className="pipeline-input w-full mt-1"
              value={detailsForm.shortPitch}
              onChange={(e) => setDetailsForm((p) => ({ ...p, shortPitch: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-text-primary">Description</span>
            <textarea
              className="pipeline-textarea w-full mt-1"
              rows={4}
              value={detailsForm.description}
              onChange={(e) => setDetailsForm((p) => ({ ...p, description: e.target.value }))}
            />
          </label>
          <Button variant="secondary" size="sm" onClick={openRequirements}>
            Edit team & visibility
          </Button>
          <div className="space-y-4 border-t border-border pt-4">
            <WorkspaceTrustCard project={project} />
            <VentureJourneyTimeline project={project} milestones={milestones} logs={logs} />
          </div>
        </div>
        {error && <p className="text-xs text-error mt-3">{error}</p>}
        <div className="flex gap-2 mt-5 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setDetailsOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={saveDetails} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Modal>

      <Modal open={requirementsOpen} onClose={() => setRequirementsOpen(false)} size="md">
        <h3 className="text-lg font-semibold text-text-primary">Team & visibility</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-text-primary">Roles needed (comma separated)</span>
            <input
              className="pipeline-input w-full mt-1"
              value={requirementsForm.rolesNeeded}
              onChange={(e) => setRequirementsForm((p) => ({ ...p, rolesNeeded: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-text-primary">Skills (comma separated)</span>
            <input
              className="pipeline-input w-full mt-1"
              value={requirementsForm.skillsRequired}
              onChange={(e) => setRequirementsForm((p) => ({ ...p, skillsRequired: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-text-primary">Visibility</span>
            <select
              className="pipeline-input w-full mt-1"
              value={requirementsForm.visibility}
              onChange={(e) => setRequirementsForm((p) => ({ ...p, visibility: e.target.value }))}
            >
              <option value="private">Private (team only)</option>
              <option value="college">College</option>
              <option value="global">Public</option>
            </select>
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={requirementsForm.lookingForTeammates}
              onChange={(e) => setRequirementsForm((p) => ({ ...p, lookingForTeammates: e.target.checked }))}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
            />
            <span>
              <span className="block font-medium text-text-primary">Find your teammate</span>
              <span className="block text-xs text-text-secondary">Let interested builders apply for a role in this venture.</span>
            </span>
          </label>
          <p className="rounded-lg border border-border bg-bg-secondary/50 px-3 py-2 text-xs text-text-secondary">
            This project is currently <strong className="text-text-primary">{project?.visibility || 'private'}</strong>. To change it, use Edit Team & Visibility here.
          </p>
          <div>
            <p className="text-sm font-medium text-text-primary mb-2">Team members</p>
            <ul className="space-y-2">
              {(project.teamMembers || []).map((member) => (
                <li
                  key={member._id || member.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>{member.name || 'Member'}</span>
                  <button
                    type="button"
                    className="text-xs text-error hover:underline"
                    onClick={() => {
                      setRemoveTarget(member)
                      setRemoveOpen(true)
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {(project.teamApplications || []).some((item) => item.status === 'pending') && (
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Teammate applications</p>
              <ul className="space-y-2">
                {(project.teamApplications || []).filter((item) => item.status === 'pending').map((item) => (
                  <li key={item._id} className="rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>{item.user?.name || 'Applicant'} · {item.role || 'Role not specified'}</span>
                      <span className="flex gap-2">
                        <Button size="xs" onClick={() => handleApplication(item._id, 'accept')} disabled={saving}>Add</Button>
                        <Button size="xs" variant="danger" onClick={() => handleApplication(item._id, 'reject')} disabled={saving}>Reject</Button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error mt-3">{error}</p>}
        <div className="flex gap-2 mt-5 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setRequirementsOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={saveRequirements} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} size="sm">
        <h3 className="text-lg font-semibold text-text-primary">Delete workspace?</h3>
        <p className="text-sm text-text-secondary mt-2">This cannot be undone.</p>
        {error && <p className="text-xs text-error mt-2">{error}</p>}
        <div className="flex gap-2 mt-5 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={saving}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal open={removeOpen} onClose={() => setRemoveOpen(false)} size="sm">
        <h3 className="text-lg font-semibold text-text-primary">Remove team member?</h3>
        <p className="text-sm text-text-secondary mt-2">{removeTarget?.name}</p>
        {error && <p className="text-xs text-error mt-2">{error}</p>}
        <div className="flex gap-2 mt-5 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setRemoveOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleRemoveMember} disabled={saving}>
            Remove
          </Button>
        </div>
      </Modal>
    </>
  )
}
