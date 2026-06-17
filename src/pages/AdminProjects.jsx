import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Input from '../components/common/Input'
import useAuth from '../hooks/useAuth'
import {
  addAdminProjectMember,
  archiveAdminProjectRecord,
  getAdminProjectRecord,
  getAdminProjectRecords,
  permanentlyRemoveAdminProjectRecord,
  removeAdminProjectFile,
  removeAdminProjectMember,
  removeAdminProjectMilestone,
  restoreAdminProjectRecord,
  updateAdminProjectBlocker,
  updateAdminProjectMilestone,
  updateAdminProjectOwner,
  updateAdminProjectRecord
} from '../features/admin/adminProjectAPI'

const editable = ['title', 'description', 'category', 'lifecycleStage', 'readinessScore', 'visibility']

export default function AdminProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [details, setDetails] = useState(null)
  const [form, setForm] = useState({})
  const [memberId, setMemberId] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')

  const loadProjects = async () => {
    const data = await getAdminProjectRecords()
    setProjects(data.projects || [])
  }

  const openProject = async (id) => {
    setSelectedId(id)
    setStatus('Loading project...')
    const data = await getAdminProjectRecord(id)
    setDetails(data)
    const project = data.project || {}
    setForm(editable.reduce((acc, key) => ({ ...acc, [key]: project[key] ?? '' }), {}))
    setStatus('')
  }

  useEffect(() => {
    loadProjects().catch(() => setStatus('Failed to load projects'))
  }, [])

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    if (!text) return projects
    return projects.filter((project) => [
      project.title,
      project.category,
      project.lifecycleStage,
      project.owner?.email,
      project.owner?.name
    ].filter(Boolean).join(' ').toLowerCase().includes(text))
  }, [projects, query])

  const saveProject = async () => {
    setStatus('Saving...')
    const payload = { ...form, readinessScore: Number(form.readinessScore) || 0 }
    const data = await updateAdminProjectRecord(selectedId, payload)
    setDetails((prev) => ({ ...prev, project: data.project }))
    await loadProjects()
    setStatus('Project updated')
  }

  const refreshProject = () => selectedId ? openProject(selectedId) : Promise.resolve()
  const runAction = async (label, action) => {
    setStatus(`${label}...`)
    await action()
    await refreshProject()
    await loadProjects()
    setStatus(`${label} complete`)
  }

  const addMember = () => memberId && runAction('Adding member', async () => {
    await addAdminProjectMember(selectedId, memberId)
    setMemberId('')
  })

  const changeOwner = () => ownerId && runAction('Changing owner', async () => {
    await updateAdminProjectOwner(selectedId, ownerId)
    setOwnerId('')
  })

  const editMilestone = (milestone) => {
    const title = window.prompt('Milestone title', milestone.title || '')
    if (title === null) return
    const statusValue = window.prompt('Milestone status', milestone.status || 'pending')
    if (statusValue === null) return
    runAction('Updating milestone', () => updateAdminProjectMilestone(selectedId, milestone._id, { title, status: statusValue }))
  }

  const editBlocker = (milestone, blocker) => {
    const description = window.prompt('Blocker description', blocker.description || '')
    if (description === null) return
    const statusValue = window.prompt('Blocker status', blocker.status || 'open')
    if (statusValue === null) return
    runAction('Updating blocker', () => updateAdminProjectBlocker(selectedId, milestone._id, blocker.blockerId, { description, status: statusValue }))
  }

  if (user?.role !== 'admin') {
    return <Card><h1 className="text-xl font-bold">Admin access required</h1></Card>
  }

  const project = details?.project
  const milestones = details?.milestones || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Project Management</h1>
        <p className="text-text-secondary">View and update startup records from the admin dashboard.</p>
      </div>

      {status && <p className="text-sm text-text-secondary">{status}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <Card hover={false}>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects..." />
          <div className="mt-4 space-y-3 max-h-[70vh] overflow-auto">
            {filtered.map((item) => (
              <button key={item._id} type="button" onClick={() => openProject(item._id)} className={`w-full text-left p-4 rounded-xl border ${selectedId === item._id ? 'border-primary bg-primary/5' : 'border-border-default bg-bg-secondary'}`}>
                <div className="font-semibold text-text-primary truncate">{item.title}</div>
                <div className="text-xs text-text-muted truncate">{item.owner?.email || 'No owner email'}</div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <Badge>{item.lifecycleStage}</Badge>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          {!project ? (
            <Card hover={false}>Select a project to open project controls.</Card>
          ) : (
            <>
              <Card hover={false}>
                <h2 className="text-xl font-bold mb-4">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
                  <Input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" />
                  <Input value={form.lifecycleStage || ''} onChange={(e) => setForm({ ...form, lifecycleStage: e.target.value })} placeholder="Lifecycle stage" />
                  <Input value={form.visibility || ''} onChange={(e) => setForm({ ...form, visibility: e.target.value })} placeholder="Visibility" />
                  <Input type="number" value={form.readinessScore || 0} onChange={(e) => setForm({ ...form, readinessScore: e.target.value })} placeholder="Readiness score" />
                </div>
                <textarea className="mt-3 w-full min-h-[100px] rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Card>

              <Card hover={false}>
                <h2 className="text-xl font-bold mb-3">Team</h2>
                <p className="text-sm">Owner: {project.owner?.name || 'Unknown'} · {project.owner?.email || ''}</p>
                <div className="mt-3 space-y-2">
                  {(project.teamMembers || []).map((m) => (
                    <div key={m._id} className="flex items-center justify-between gap-3 text-sm">
                      <span>{m.name || m.email} · {m.email}</span>
                      <Button size="xs" variant="danger" onClick={() => runAction('Removing member', () => removeAdminProjectMember(selectedId, m._id))}>Remove</Button>
                    </div>
                  ))}
                  {!(project.teamMembers || []).length && <p className="text-sm text-text-muted">No members.</p>}
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="User ID to add" />
                  <Button variant="secondary" onClick={addMember}>Add Member</Button>
                  <Input value={ownerId} onChange={(e) => setOwnerId(e.target.value)} placeholder="User ID for new owner" />
                  <Button variant="secondary" onClick={changeOwner}>Change Owner</Button>
                </div>
              </Card>

              <Card hover={false}>
                <h2 className="text-xl font-bold mb-3">Milestones</h2>
                {milestones.map((m) => (
                  <div key={m._id} className="border-b border-border-default py-3 text-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span>{m.title} · {m.status}</span>
                      <div className="flex gap-2">
                        <Button size="xs" variant="secondary" onClick={() => editMilestone(m)}>Edit</Button>
                        <Button size="xs" variant="danger" onClick={() => window.confirm('Remove milestone?') && runAction('Removing milestone', () => removeAdminProjectMilestone(selectedId, m._id))}>Remove</Button>
                      </div>
                    </div>
                    {(m.blockerDetails || []).map((b) => (
                      <div key={b.blockerId} className="flex items-center justify-between gap-3 text-xs text-text-secondary">
                        <span>Blocker: {b.description} · {b.status}</span>
                        <Button size="xs" variant="ghost" onClick={() => editBlocker(m, b)}>Update blocker</Button>
                      </div>
                    ))}
                  </div>
                ))}
                {!milestones.length && <p className="text-sm text-text-muted">No milestones.</p>}
              </Card>

              <Card hover={false}>
                <h2 className="text-xl font-bold mb-3">Files</h2>
                {(project.files || []).map((file) => (
                  <div key={file._id || file.filename} className="flex items-center justify-between gap-3 text-sm py-2">
                    <span>{file.originalName} · {Math.round((file.size || 0) / 1024)} KB</span>
                    <Button size="xs" variant="danger" onClick={() => window.confirm('Remove file reference?') && runAction('Removing file', () => removeAdminProjectFile(selectedId, file._id || file.filename))}>Remove</Button>
                  </div>
                ))}
                {!(project.files || []).length && <p className="text-sm text-text-muted">No files.</p>}
              </Card>

              <Card hover={false} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Actions</h2>
                  <p className="text-sm text-text-secondary">Save fields, archive/restore, or permanently remove with confirmation.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={saveProject}>Save Changes</Button>
                  <Button variant="secondary" onClick={() => runAction('Archiving project', () => archiveAdminProjectRecord(selectedId))}>Archive</Button>
                  <Button variant="secondary" onClick={() => runAction('Restoring project', () => restoreAdminProjectRecord(selectedId, 'idea'))}>Restore</Button>
                  <Button variant="danger" onClick={() => window.prompt('Type DELETE to permanently remove') === 'DELETE' && runAction('Removing project', () => permanentlyRemoveAdminProjectRecord(selectedId))}>Permanent Remove</Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
