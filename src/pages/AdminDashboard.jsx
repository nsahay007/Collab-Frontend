import React, { useEffect, useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { getAllUsers } from '../features/auth/authAPI'
import { getUserActivity } from '../features/user/userAPI'

function UserRow({ user }) {
  return (
    <tr className="border-b border-border-default hover:bg-bg-secondary transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-text-primary">#{user._id.toString().slice(-6)}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-text-primary font-medium">{user.email}</div>
      </td>
      <td className="py-4 px-4">
        <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      </td>
      <td className="py-4 px-4">
        <Badge variant={user.emailVerified ? 'success' : 'default'}>
          {user.emailVerified ? 'Verified' : 'Unverified'}
        </Badge>
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-2">
          <Button variant="ghost">Edit</Button>
          <Button variant="secondary">View</Button>
        </div>
      </td>
    </tr>
  )
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [activityUsers, setActivityUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const [error, setError] = useState('')
  const [activityError, setActivityError] = useState('')
  const [activeWithin, setActiveWithin] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers()
        setUsers(response.data)
      } catch (err) {
        console.error('Failed to fetch users:', err)
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const loadActivity = async (minutes) => {
    try {
      setActivityLoading(true)
      setActivityError('')
      const response = await getUserActivity(minutes)
      setActivityUsers(response?.users || [])
    } catch (err) {
      console.error('Failed to fetch activity:', err)
      setActivityError('Failed to load activity data')
    } finally {
      setActivityLoading(false)
    }
  }

  useEffect(() => {
    loadActivity()
  }, [])

  const handleActivityFilter = () => {
    const minutes = activeWithin.trim()
    loadActivity(minutes ? Number(minutes) : undefined)
  }

  const stats = [
    { label: 'Total Users', value: users.length.toString(), change: '+12%' },
    { label: 'Active Projects', value: '89', change: '+5%' },
    { label: 'Validations Run', value: '456', change: '+23%' },
    { label: 'New Signups', value: '67', change: '+18%' }
  ]

  if (loading) {
    return <div>Loading users...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
        <p className="text-text-secondary">Manage users, monitor activity, and oversee system operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-text-secondary text-sm mb-2">{stat.label}</div>
            <div className="text-xs text-green-600 font-medium">{stat.change}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">User Management</h2>
          <div className="flex gap-3">
            <Button variant="secondary">Export</Button>
            <Button variant="primary">Add User</Button>
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">User ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">Role</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">Status</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow key={user._id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-text-primary">User Activity</h2>
            <p className="text-sm text-text-secondary">Track last active time and build inactivity.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              placeholder="Active within (mins)"
              value={activeWithin}
              onChange={(e) => setActiveWithin(e.target.value)}
              className="w-40 rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary"
            />
            <Button variant="secondary" size="sm" onClick={handleActivityFilter}>
              Apply
            </Button>
          </div>
        </div>

        {activityLoading ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-6 text-center text-text-secondary">
            Loading activity...
          </div>
        ) : activityError ? (
          <div className="rounded-xl border border-error/40 bg-error/10 p-4 text-error">
            {activityError}
          </div>
        ) : activityUsers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-6 text-center text-text-secondary">
            No users found with the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-text-muted">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Inactive For</th>
                  <th className="py-3 px-4">Build Inactivity</th>
                </tr>
              </thead>
              <tbody>
                {activityUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border-default">
                    <td className="py-3 px-4">
                      <div className="text-text-primary font-medium">{user.name}</div>
                      <div className="text-xs text-text-muted">{user.email}</div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {user.lastActive ? new Date(user.lastActive).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {user.inactiveForMinutes != null
                        ? `${user.inactiveForMinutes} mins (${user.inactiveForHours} hrs)`
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {user.buildInactivity?.length ? (
                        <div className="space-y-1">
                          {user.buildInactivity.map((item) => (
                            <div key={item.projectId} className="text-xs">
                              <span className="font-medium text-text-primary">{item.title}</span>
                              <span className="text-text-muted"> · {item.inactiveForMinutes ?? '—'} mins</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        'No active builds'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
