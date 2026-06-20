import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import useAuth from '../hooks/useAuth'
import { getAllUsers } from '../features/auth/authAPI'
import { getUserById } from '../features/user/userAPI'
import { getAdminProjectRecord, getAdminProjectRecords } from '../features/admin/adminProjectAPI'

export default function AdminUserLookup() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllUsers({ limit: 100 })
      .then((res) => setUsers(res?.data?.users || []))
      .catch(() => setUsers([]))
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return users.filter((item) => (
      String(item._id || '').toLowerCase().includes(q)
      || String(item.email || '').toLowerCase().includes(q)
      || String(item.name || '').toLowerCase().includes(q)
    )).slice(0, 8)
  }, [query, users])

  const loadUser = async (candidate) => {
    setLoading(true)
    setError('')
    try {
      const detail = await getUserById(candidate._id)
      const profile = detail?.user || candidate
      const allProjects = await getAdminProjectRecords()
      const uid = String(profile._id || profile.id)
      const memberships = (allProjects?.projects || []).filter((project) => (
        String(project.owner?._id || project.owner || '') === uid
        || (project.teamMembers || []).some((member) => String(member?._id || member) === uid)
      ))
      const hydrated = await Promise.all(memberships.slice(0, 12).map(async (project) => {
        try {
          const full = await getAdminProjectRecord(project._id || project.id)
          return full?.project || project
        } catch (_) {
          return project
        }
      }))
      setSelected(profile)
      setProjects(hydrated)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load user lookup.')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return <Card hover={false}>Admin access required.</Card>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">Admin</p>
          <h1 className="text-3xl font-bold text-text-primary">User Lookup</h1>
          <p className="text-text-secondary">Search users and review venture participation.</p>
        </div>
        <Link to="/admin"><Button variant="secondary">Back to Admin</Button></Link>
      </div>

      <Card hover={false}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by User ID, email, or name"
          className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
        />
        <div className="mt-3 space-y-2">
          {results.map((item) => (
            <button key={item._id} type="button" onClick={() => loadUser(item)} className="w-full rounded-xl border border-border bg-bg-secondary/40 px-3 py-2 text-left hover:border-primary/40">
              <p className="font-medium text-text-primary">{item.name}</p>
              <p className="text-xs text-text-muted">{item.email} · {item._id}</p>
            </button>
          ))}
        </div>
        {loading && <p className="mt-3 text-sm text-text-muted">Loading...</p>}
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
      </Card>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card hover={false}>
            <p className="text-xs uppercase tracking-wide text-text-muted">Profile information</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{selected.name}</h2>
            <p className="text-sm text-text-secondary">{selected.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={selected.role === 'admin' ? 'primary' : 'default'}>{selected.role || 'user'}</Badge>
              <Badge variant={selected.emailVerified ? 'success' : 'default'}>{selected.emailVerified ? 'Verified' : 'Unverified'}</Badge>
            </div>
            <p className="mt-3 text-xs text-text-muted break-all">User ID: {selected._id || selected.id}</p>
          </Card>

          <Card hover={false}>
            <p className="text-xs uppercase tracking-wide text-text-muted">Project memberships & venture participation</p>
            <div className="mt-3 space-y-3">
              {projects.length ? projects.map((project) => {
                const isOwner = String(project.owner?._id || project.owner || '') === String(selected._id || selected.id)
                const certCount = project.validation?.certificates?.length || 0
                return (
                  <div key={project._id || project.id} className="rounded-xl border border-border bg-bg-secondary/40 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text-primary">{project.title}</p>
                        <p className="text-xs text-text-muted">{project.category || 'Venture'} · {project.lifecycleStage || 'idea'}</p>
                      </div>
                      <Badge variant={isOwner ? 'primary' : 'secondary'}>{isOwner ? 'Owner' : 'Member'}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">
                      Documents: Startup package available, provenance report available, creation record {project.startupCreationRecord?.verificationHash ? 'recorded' : 'pending'}, certificates generated: {certCount}.
                    </p>
                  </div>
                )
              }) : <p className="text-sm text-text-muted">No project memberships found.</p>}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
