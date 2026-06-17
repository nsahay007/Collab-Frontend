import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Input from '../components/common/Input'
import useAuth from '../hooks/useAuth'
import {
  addAdminProjectMember,
  archiveAdminProjectRecord,
  getAdminProjectFileDownloadUrl,
  getAdminProjectRecord,
  getAdminProjectRecords,
  getAdminUsers,
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
import { runAdminRequest } from '../features/admin/adminRequest'

const editable = ['title', 'description', 'category', 'lifecycleStage', 'readinessScore', 'visibility']
const categoryOptions = ['Tech & Product', 'Business & Startup', 'Design & Creative', 'Marketing & Content', 'Services & Operations']
const lifecycleOptions = [
  ['idea', 'idea'],
  ['validation', 'validation'],
  ['mvp', 'mvp'],
  ['incubation', 'incubation_ready'],
  ['launch', 'incubation_ready'],
  ['growth', 'incubation_ready'],
  ['archived', 'archived']
]
const visibilityOptions = [
  ['private', 'private'],
  ['team', 'college'],
  ['public', 'global']
]
const toUiLifecycle = (value) => value === 'incubation_ready' ? 'incubation' : value || 'idea'
const toUiVisibility = (value) => value === 'college' ? 'team' : value === 'global' ? 'public' : value || 'private'
const findUser = (users, id) => users.find((item) => String(item._id || item.id) === String(id))

export default function AdminProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [details, setDetails] = useState(null)
  const [form, setForm] = useState({})
  const [users, setUsers] = useState([])
  const [userQuery, setUserQuery] = useState('')
  const [memberUserId, setMemberUserId] = useState('')
  const [ownerUserId, setOwnerUserId] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  const loadProjects = async () => {
    const data = await getAdminProjectRecords()
    setProjects(data.projects || [])
  }

  const loadUsers = async () => {
    const data = await getAdminUsers()
    setUsers(data.users || [])
  }

  const openProject = async (id) => {
    try {
      setSelectedId(id)
      const data = await runAdminRequest('Loading project', () => getAdminProjectRecord(id), { setStatus, setLoading: setLoadingAction })
      setDetails(data)
      const project = data.project || {}
      setForm({
        ...editable.reduce((acc, key) => ({ ...acc, [key]: project[key] ?? '' }), {}),
        lifecycleStage: toUiLifecycle(project.lifecycleStage),
        visibility: toUiVisibility(project.visibility)
      })
    } catch {
      // status already contains backend error
    }
  }

  useEffect(() => {
    loadProjects().catch(() => setStatus('Failed to load projects'))
    loadUsers().catch(() => setStatus('Failed to load users'))
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
    const lifecycleValue = lifecycleOptions.find(([label]) => label === form.lifecycleStage)?.[1] || form.lifecycleStage
    const visibilityValue = visibilityOptions.find(([label]) => label === form.visibility)?.[1] || form.visibility
    const payload = {
      ...form,
      lifecycleStage: lifecycleValue,
      visibility: visibilityValue,
      readinessScore: Math.max(0, Math.min(100, Number(form.readinessScore) || 0))
    }
    try {
      await runAdminRequest('Saving project', () => updateAdminProjectRecord(selectedId, payload), { setStatus, setLoading: setLoadingAction, payload })
      await openProject(selectedId)
      await loadProjects()
      setStatus('Project updated')
    } catch {
      // status already contains backend error
    }
  }

  const refreshProject = () => selectedId ? openProject(selectedId) : Promise.resolve()
  const runAction = async (label, action) => {
    try {
      await runAdminRequest(label, action, { setStatus, setLoading: setLoadingAction })
      await refreshProject()
      await loadProjects()
    } catch {
      // status already contains backend error
    }
  }

  const addMember = () => memberUserId && runAction('Adding member', async () => {
    await addAdminProjectMember(selectedId, memberUserId)
    setMemberUserId('')
  })

  const changeOwner = () => ownerUserId && runAction('Changing owner', async () => {
    await updateAdminProjectOwner(selectedId, ownerUserId)
    setOwnerUserId('')
  })

  const permanentlyRemoveProject = async () => {
    if (window.prompt('Type DELETE to permanently remove') !== 'DELETE') return
    try {
      await runAdminRequest('Removing project', () => permanentlyRemoveAdminProjectRecord(selectedId), { setStatus, setLoading: setLoadingAction })
      setSelectedId('')
      setDetails(null)
      await loadProjects()
    } catch {
      // status already contains backend error
    }
  }

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

  const deleteBlocker = (milestone, blocker) => {
    runAction('Deleting blocker', () => updateAdminProjectBlocker(selectedId, milestone._id, blocker.blockerId, {
      description: blocker.description || 'Removed by admin',
      status: 'resolved'
    }))
  }

  if (user?.role !== 'admin') {
    return <Card><h1 className="text-xl font-bold">Admin access required</h1></Card>
  }

  const project = details?.project
  const milestones = details?.milestones || []
  const filteredUsers = users.filter((item) => {
    const text = userQuery.trim().toLowerCase()
    if (!text) return true
    return [item.name, item.email, item._id].filter(Boolean).join(' ').toLowerCase().includes(text)
  }).slice(0, 20)
  const selectedMember = findUser(users, memberUserId)
  const selectedOwner = findUser(users, ownerUserId)
  const projectFiles = [...(project?.files || []), ...(project?.validation?.sharedFiles || [])]

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
                  <select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={form.lifecycleStage || 'idea'} onChange={(e) => setForm({ ...form, lifecycleStage: e.target.value })}>
                    {lifecycleOptions.map(([label]) => <option key={label} value={label}>{label}</option>)}
                  </select>
                  <select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={form.visibility || 'private'} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
                    {visibilityOptions.map(([label]) => <option key={label} value={label}>{label}</option>)}
                  </select>
                  <Input type="number" min="0" max="100" value={form.readinessScore || 0} onChange={(e) => setForm({ ...form, readinessScore: e.target.value })} placeholder="Readiness score" />
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
                  <Input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search users by name/email/full ID" />
                  <select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)}>
                    <option value="">Select member to add</option>
                    {filteredUsers.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.email}</option>)}
                  </select>
                  <Button variant="secondary" disabled={!memberUserId || loadingAction} onClick={addMember}>Add {selectedMember?.name || 'Member'}</Button>
                  <select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={ownerUserId} onChange={(e) => setOwnerUserId(e.target.value)}>
                    <option value="">Select new owner</option>
                    {filteredUsers.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.email}</option>)}
                  </select>
                  <div className="md:col-span-2">
                    <Button variant="secondary" disabled={!ownerUserId || loadingAction} onClick={changeOwner}>Change Owner{selectedOwner ? ` to ${selectedOwner.name}` : ''}</Button>
                  </div>
                </div>
              </Card>

              <Card hover={false}>
                <h2 className="text-xl font-bold mb-3">Milestones</h2>
                {milestones.map((m) => (
                  <div key={m._id} className="border-b border-border-default py-3 text-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span>{m.title} · {m.status} · {m.priority || 'medium'} · {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'No due date'}</span>
                      <div className="flex gap-2">
                        <Button size="xs" variant="secondary" onClick={() => editMilestone(m)}>Edit</Button>
                        <Button size="xs" variant="danger" onClick={() => window.confirm('Remove milestone?') && runAction('Removing milestone', () => removeAdminProjectMilestone(selectedId, m._id))}>Remove</Button>
                      </div>
                    </div>
                    {(m.blockerDetails || []).map((b) => (
                      <div key={b.blockerId} className="flex items-center justify-between gap-3 text-xs text-text-secondary">
                        <span>Blocker: {b.description} · {b.status}</span>
                        <div className="flex gap-2">
                          <Button size="xs" variant="ghost" onClick={() => editBlocker(m, b)}>Edit blocker</Button>
                          <Button size="xs" variant="danger" onClick={() => window.confirm('Delete blocker?') && deleteBlocker(m, b)}>Delete blocker</Button>
                        </div>
                      </div>
                    ))}
                    {!(m.blockerDetails || []).length && <p className="text-xs text-text-muted">No blockers.</p>}
                  </div>
                ))}
                {!milestones.length && <p className="text-sm text-text-muted">No milestones found.</p>}
              </Card>

              <Card hover={false}>
                <h2 className="text-xl font-bold mb-3">Files</h2>
                {projectFiles.map((file) => (
                  <div key={file._id || file.filename} className="flex items-center justify-between gap-3 text-sm py-2">
                    <span className="min-w-0 truncate">{file.originalName || file.filename} · {Math.round((file.size || 0) / 1024)} KB</span>
                    <div className="flex shrink-0 gap-2">
                      <Button size="xs" variant="secondary" onClick={() => window.open(getAdminProjectFileDownloadUrl(selectedId, file._id || file.filename), '_blank', 'noopener,noreferrer')}>View</Button>
                      <Button size="xs" variant="secondary" onClick={() => window.open(getAdminProjectFileDownloadUrl(selectedId, file._id || file.filename), '_blank', 'noopener,noreferrer')}>Download</Button>
                      <Button size="xs" variant="danger" onClick={() => window.confirm('Remove file reference?') && runAction('Removing file', () => removeAdminProjectFile(selectedId, file._id || file.filename))}>Remove</Button>
                    </div>
                  </div>
                ))}
                {!projectFiles.length && <p className="text-sm text-text-muted">No files.</p>}
              </Card>

              <Card hover={false} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Actions</h2>
                  <p className="text-sm text-text-secondary">Save fields, archive/restore, or permanently remove with confirmation.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button disabled={loadingAction} onClick={saveProject}>Save Changes</Button>
                  <Button disabled={loadingAction} variant="secondary" onClick={() => runAction('Archiving project', () => archiveAdminProjectRecord(selectedId))}>Archive</Button>
                  <Button disabled={loadingAction} variant="secondary" onClick={() => runAction('Restoring project', () => restoreAdminProjectRecord(selectedId, 'idea'))}>Restore</Button>
                  <Button disabled={loadingAction} variant="danger" onClick={permanentlyRemoveProject}>Permanent Remove</Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
