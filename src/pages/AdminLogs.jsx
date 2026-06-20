import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useAuth from '../hooks/useAuth'
import { getAdminLogs } from '../features/admin/adminLogsAPI'

const rowTime = (value) => (value ? new Date(value).toLocaleString() : 'Unknown time')

export default function AdminLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState({ adminLogs: [], projectAccessLogs: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminLogs()
      .then((data) => setLogs(data || { adminLogs: [], projectAccessLogs: [] }))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load logs.'))
      .finally(() => setLoading(false))
  }, [])

  if (user?.role !== 'admin') return <Card hover={false}>Admin access required.</Card>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">Security & Audit</p>
          <h1 className="text-3xl font-bold text-text-primary">Platform Logs</h1>
          <p className="text-text-secondary">Review admin actions and project access transparency events.</p>
        </div>
        <Link to="/admin"><Button variant="secondary">Back to Admin</Button></Link>
      </div>
      {loading && <Card hover={false}>Loading logs...</Card>}
      {error && <Card hover={false} className="border-error/30 text-error">{error}</Card>}
      {!loading && !error && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card hover={false}>
            <h2 className="text-xl font-semibold text-text-primary">Admin Audit Logs</h2>
            <div className="mt-4 space-y-2">
              {(logs.adminLogs || []).map((item) => (
                <div key={item._id} className="rounded-xl border border-border bg-bg-secondary/40 p-3 text-sm">
                  <p className="font-semibold text-text-primary">{item.action}</p>
                  <p className="text-xs text-text-muted">{item.adminUser?.name || item.adminUser?.email || 'Admin'} · {item.targetType} · {rowTime(item.timestamp)}</p>
                </div>
              ))}
              {!(logs.adminLogs || []).length && <p className="text-sm text-text-muted">No admin logs yet.</p>}
            </div>
          </Card>
          <Card hover={false}>
            <h2 className="text-xl font-semibold text-text-primary">Student Data Access Logs</h2>
            <div className="mt-4 space-y-2">
              {(logs.projectAccessLogs || []).map((item) => (
                <div key={item._id} className="rounded-xl border border-border bg-bg-secondary/40 p-3 text-sm">
                  <p className="font-semibold text-text-primary">{item.accessType}</p>
                  <p className="text-xs text-text-muted">{item.project?.title || 'Project'} · {item.user?.name || item.user?.email || 'User'} · {rowTime(item.timestamp)}</p>
                </div>
              ))}
              {!(logs.projectAccessLogs || []).length && <p className="text-sm text-text-muted">No project access logs yet.</p>}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
