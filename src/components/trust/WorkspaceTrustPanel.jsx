import React, { useEffect, useState } from 'react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import useAuth from '../../hooks/useAuth'
import { downloadCreationRecord, downloadVentureProvenanceReport, fetchProjectAccessHistory } from '../../features/projects/projectAPI'

const saveBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const actionLabel = {
  project_view: 'Project opened',
  validation_view: 'Validation viewed',
  package_download: 'Package downloaded',
  admin_access: 'Admin review recorded'
}

export function WorkspaceTrustCard({ project }) {
  const record = project?.startupCreationRecord
  const projectId = project?._id || project?.id
  return (
    <Card hover={false} className="border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">Trust & Privacy</p>
          <h2 className="mt-1 text-lg font-semibold text-text-primary">Workspace protection</h2>
        </div>
        <Badge variant="primary">Ownership Recorded</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
        <p>✓ Workspace Visibility: {project?.visibility || 'private'}</p>
        <p>✓ Team Access: Restricted to team members</p>
        <p>✓ File Access Controls: Signed downloads</p>
        <p>✓ Ownership Information: {record?.verificationHash ? 'Recorded' : 'Available after refresh'}</p>
        <p>✓ Venture Documentation: Creation and provenance exports</p>
      </div>
      {record?.verificationHash && (
        <div className="mt-4 rounded-xl border border-border bg-bg-secondary/40 p-3">
          <p className="text-sm font-semibold text-text-primary">Startup Creation Record</p>
          <p className="mt-1 text-xs text-text-secondary">Startup: {record.projectName || project?.title}</p>
          <p className="text-xs text-text-secondary">Project ID: {record.projectId || projectId}</p>
          <p className="mt-1 text-xs text-text-muted break-all">Hash: {record.verificationHash}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={async () => saveBlob(await downloadCreationRecord(projectId), 'startup_creation_record.pdf')}
            >
              Export Creation Record
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={async () => saveBlob(await downloadVentureProvenanceReport(projectId), 'venture_provenance_report.pdf')}
            >
              Download Venture Provenance Report
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export function ProjectAccessHistory({ project }) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')
  const projectId = project?._id || project?.id
  const ownerId = project?.owner?._id || project?.owner
  const canView = user?.role === 'admin' || String(user?.id || user?._id || '') === String(ownerId || '')

  useEffect(() => {
    if (!projectId || !canView) return
    fetchProjectAccessHistory(projectId)
      .then((data) => setLogs(data?.logs || []))
      .catch((err) => setError(err?.response?.data?.message || 'Unable to load access history'))
  }, [projectId, canView])

  if (!canView) return null

  return (
    <Card hover={false}>
      <p className="text-xs uppercase tracking-wide text-text-muted">Project Access History</p>
      <h2 className="mt-1 text-lg font-semibold text-text-primary">Recent access</h2>
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      <div className="mt-4 space-y-2">
        {logs.length ? logs.map((log) => (
          <div key={log._id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-secondary/40 px-3 py-2 text-sm">
            <span className="text-text-primary">{log.user?.name || 'User'}</span>
            <span className="text-text-secondary">{actionLabel[log.accessType] || log.accessType}</span>
            <span className="text-xs text-text-muted">{new Date(log.timestamp).toLocaleString()}</span>
          </div>
        )) : <p className="text-sm text-text-muted">No access history yet.</p>}
      </div>
    </Card>
  )
}

export function VentureJourneyTimeline({ project, milestones = [], logs = [] }) {
  const events = [
    project?.createdAt && {
      date: project.createdAt,
      title: 'Startup workspace created',
      detail: project.title || 'Venture created',
      tone: 'primary'
    },
    ...(milestones || []).map((milestone) => ({
      date: milestone.completedAt || milestone.updatedAt || milestone.createdAt,
      title: milestone.status === 'completed' ? 'Milestone completed' : 'Milestone planned',
      detail: milestone.title,
      tone: milestone.status === 'completed' ? 'success' : 'default'
    })),
    ...(logs || []).map((log) => ({
      date: log.timestamp || log.createdAt,
      title: log.action || 'Progress updated',
      detail: log.impact || log.milestoneId?.title || 'Startup progress recorded',
      tone: 'secondary'
    }))
  ]
    .filter((event) => event?.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14)

  return (
    <Card hover={false}>
      <p className="text-xs uppercase tracking-wide text-text-muted">Venture Journey</p>
      <h2 className="mt-1 text-lg font-semibold text-text-primary">Startup progress timeline</h2>
      <div className="mt-4 space-y-3">
        {events.length ? events.map((event, index) => (
          <div key={`${event.title}-${event.date}-${index}`} className="flex gap-3">
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
            <div className="min-w-0 flex-1 rounded-xl border border-border bg-bg-secondary/40 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text-primary">{event.title}</p>
                <Badge variant={event.tone}>{new Date(event.date).toLocaleDateString()}</Badge>
              </div>
              {event.detail && <p className="mt-1 text-xs text-text-secondary line-clamp-2">{event.detail}</p>}
            </div>
          </div>
        )) : (
          <p className="text-sm text-text-muted">Your venture journey will appear as progress is recorded.</p>
        )}
      </div>
    </Card>
  )
}
