import React, { useEffect, useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { getAllUsers } from '../features/auth/authAPI'
import {
  getAdminStats,
  getUserActivity,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin
} from '../features/user/userAPI'
import useAuth from '../hooks/useAuth'

function UserRow({ user, onEdit, onView }) {
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
          <Button variant="ghost" onClick={() => onEdit(user)}>Edit</Button>
          <Button variant="secondary" onClick={() => onView(user)}>View</Button>
        </div>
      </td>
    </tr>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [activityUsers, setActivityUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const [error, setError] = useState('')
  const [activityError, setActivityError] = useState('')
  const [activeWithin, setActiveWithin] = useState('')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    validationsRun: 0,
    newSignups: 0,
    signupWindowDays: 7
  })
  const [statsError, setStatsError] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)
  const [modalMode, setModalMode] = useState('view')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    emailVerified: false,
    points: 0,
    course: '',
    yearOfStudy: '',
    skills: '',
    primaryCategory: '',
    phone: ''
  })
  const [userActionStatus, setUserActionStatus] = useState(null)
  const [userActionLoading, setUserActionLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers()
      const list = Array.isArray(response?.data) ? response.data : response?.data?.users || []
      setUsers(list)
      setError('')
    } catch (err) {
      console.error('Failed to fetch users:', err)
      const message = err?.response?.status === 403 ? 'Admin access required' : 'Failed to load users'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await getAdminStats()
      const payload = response?.stats || response?.data?.stats || {}
      setStats({
        totalUsers: payload.totalUsers ?? 0,
        activeProjects: payload.activeProjects ?? 0,
        validationsRun: payload.validationsRun ?? 0,
        newSignups: payload.newSignups ?? 0,
        signupWindowDays: payload.signupWindowDays ?? 7
      })
      setStatsError('')
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
      const message = err?.response?.status === 403 ? 'Admin access required' : 'Failed to load stats'
      setStatsError(message)
    }
  }

  useEffect(() => {
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
    loadActivity(activeWithin ? Number(activeWithin) : undefined)
    loadStats()
    const interval = setInterval(() => {
      fetchUsers()
      loadActivity(activeWithin ? Number(activeWithin) : undefined)
      loadStats()
    }, 20000)
    return () => clearInterval(interval)
  }, [activeWithin])

  const handleExport = () => {
    if (!users.length) return
    const rows = [
      ['id', 'name', 'email', 'role', 'emailVerified', 'points', 'lastActive', 'createdAt']
    ]
    users.forEach((user) => {
      rows.push([
        user._id,
        user.name,
        user.email,
        user.role,
        user.emailVerified ? 'verified' : 'unverified',
        user.points ?? 0,
        user.lastActive ? new Date(user.lastActive).toISOString() : '',
        user.createdAt ? new Date(user.createdAt).toISOString() : ''
      ])
    })
    const csv = rows.map((row) => row.map((value) => {
      const str = value == null ? '' : String(value)
      return `"${str.replace(/"/g, '""')}"`
    }).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `collab-users-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'user',
      emailVerified: false,
      points: 0,
      course: '',
      yearOfStudy: '',
      skills: '',
      primaryCategory: '',
      phone: ''
    })
  }

  const openUserModal = async (mode, user) => {
    setModalMode(mode)
    setSelectedUser(user || null)
    setUserDetails(null)
    setUserActionStatus(null)
    resetUserForm()
    setShowUserModal(true)

    if (mode === 'create') {
      return
    }

    if (!user?._id) return

    setUserActionLoading(true)
    try {
      const response = await getUserById(user._id)
      const details = response?.user || response?.data?.user
      setUserDetails(details || null)
      setUserForm({
        name: details?.name || '',
        email: details?.email || user.email || '',
        password: '',
        role: details?.role || user.role || 'user',
        emailVerified: Boolean(details?.emailVerified),
        points: details?.points ?? 0,
        course: details?.course || '',
        yearOfStudy: details?.yearOfStudy || '',
        skills: (details?.skills || []).join(', '),
        primaryCategory: details?.primaryCategory || '',
        phone: details?.phone || ''
      })
    } catch (err) {
      console.error('Failed to load user details:', err)
      setUserActionStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to load user details.'
      })
    } finally {
      setUserActionLoading(false)
    }
  }

  const closeUserModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
    setUserDetails(null)
    setUserActionStatus(null)
    resetUserForm()
  }

  const handleUserFormChange = (event) => {
    const { name, value, type, checked } = event.target
    setUserForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSaveUser = async () => {
    setUserActionStatus(null)
    setUserActionLoading(true)
    try {
      const payload = {
        name: userForm.name,
        role: userForm.role,
        emailVerified: userForm.emailVerified,
        points: Number(userForm.points),
        course: userForm.course,
        yearOfStudy: userForm.yearOfStudy,
        skills: userForm.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        primaryCategory: userForm.primaryCategory,
        phone: userForm.phone
      }
      await updateUserByAdmin(selectedUser._id, payload)
      setUserActionStatus({ type: 'success', message: 'User updated successfully.' })
      fetchUsers()
      loadStats()
    } catch (err) {
      console.error('Failed to update user:', err)
      setUserActionStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update user.'
      })
    } finally {
      setUserActionLoading(false)
    }
  }

  const handleCreateUser = async () => {
    setUserActionStatus(null)
    setUserActionLoading(true)
    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        emailVerified: userForm.emailVerified,
        course: userForm.course,
        yearOfStudy: userForm.yearOfStudy,
        skills: userForm.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        primaryCategory: userForm.primaryCategory,
        phone: userForm.phone
      }
      await createUserByAdmin(payload)
      setUserActionStatus({ type: 'success', message: 'User created successfully.' })
      fetchUsers()
      loadStats()
      resetUserForm()
    } catch (err) {
      console.error('Failed to create user:', err)
      setUserActionStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to create user.'
      })
    } finally {
      setUserActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser?._id) return
    const confirmed = window.confirm('Delete this user? This cannot be undone.')
    if (!confirmed) return
    setUserActionStatus(null)
    setUserActionLoading(true)
    try {
      await deleteUserByAdmin(selectedUser._id)
      setUserActionStatus({ type: 'success', message: 'User deleted.' })
      fetchUsers()
      loadStats()
      closeUserModal()
    } catch (err) {
      console.error('Failed to delete user:', err)
      setUserActionStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to delete user.'
      })
    } finally {
      setUserActionLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toString() },
    { label: 'Active Projects', value: stats.activeProjects.toString() },
    { label: 'Validations Run', value: stats.validationsRun.toString() },
    { label: `New Signups (${stats.signupWindowDays}d)`, value: stats.newSignups.toString() }
  ]

  if (loading) {
    return <div>Loading users...</div>
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Admin access required</h2>
          <p className="text-sm text-text-secondary">
            This page is only available to admin accounts.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
        <p className="text-text-secondary">Manage users, monitor activity, and oversee system operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-text-secondary text-sm mb-2">{stat.label}</div>
            <div className="text-xs text-text-muted">
              {statsError ? statsError : 'Live'}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">User Management</h2>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleExport} disabled={users.length === 0}>
              Export
            </Button>
            <Button variant="primary" onClick={() => openUserModal('create')}>Add User</Button>
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
                <UserRow
                  key={user._id}
                  user={user}
                  onEdit={(selected) => openUserModal('edit', selected)}
                  onView={(selected) => openUserModal('view', selected)}
                />
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

      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text-primary">
                {modalMode === 'create'
                  ? 'Add User'
                  : modalMode === 'edit'
                    ? 'Edit User'
                    : 'User Details'}
              </h3>
              <button
                type="button"
                onClick={closeUserModal}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            {userActionStatus && (
              <div
                className={`mb-4 rounded-xl border p-3 text-sm ${
                  userActionStatus.type === 'success'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-error/40 bg-error/10 text-error'
                }`}
              >
                {userActionStatus.message}
              </div>
            )}

            {userActionLoading && modalMode !== 'create' ? (
              <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-6 text-center text-text-secondary">
                Loading user details...
              </div>
            ) : modalMode === 'view' ? (
              <div className="space-y-3 text-sm text-text-secondary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs uppercase text-text-muted">Name</div>
                    <div className="text-text-primary font-medium">{userDetails?.name || selectedUser?.name || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-text-muted">Email</div>
                    <div className="text-text-primary font-medium">{userDetails?.email || selectedUser?.email || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-text-muted">Role</div>
                    <div className="text-text-primary font-medium">{userDetails?.role || selectedUser?.role || 'user'}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-text-muted">Status</div>
                    <div className="text-text-primary font-medium">
                      {userDetails?.emailVerified ? 'Verified' : 'Unverified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-text-muted">Points</div>
                    <div className="text-text-primary font-medium">{userDetails?.points ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-text-muted">Last Active</div>
                    <div className="text-text-primary font-medium">
                      {userDetails?.lastActive ? new Date(userDetails.lastActive).toLocaleString() : '—'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-text-muted">Skills</div>
                  <div className="text-text-primary font-medium">
                    {(userDetails?.skills || []).length ? userDetails.skills.join(', ') : '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Name</label>
                    <input
                      name="name"
                      value={userForm.name}
                      onChange={handleUserFormChange}
                      className="mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Email</label>
                    <input
                      name="email"
                      value={userForm.email}
                      onChange={handleUserFormChange}
                      disabled={modalMode === 'edit'}
                      className={`mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 ${
                        modalMode === 'edit' ? 'text-text-muted' : 'text-text-primary'
                      }`}
                    />
                  </div>
                  {modalMode === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-text-primary">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={userForm.password}
                        onChange={handleUserFormChange}
                        className="mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Role</label>
                    <select
                      name="role"
                      value={userForm.role}
                      onChange={handleUserFormChange}
                      className="mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Points</label>
                    <input
                      type="number"
                      name="points"
                      value={userForm.points}
                      onChange={handleUserFormChange}
                      className="mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="emailVerified"
                      name="emailVerified"
                      checked={userForm.emailVerified}
                      onChange={handleUserFormChange}
                      className="h-4 w-4"
                    />
                    <label htmlFor="emailVerified" className="text-sm text-text-primary">
                      Email verified
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Course</label>
                    <input
                      name="course"
                      value={userForm.course}
                      onChange={handleUserFormChange}
                      className="mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Year of Study</label>
                    <input
                      name="yearOfStudy"
                      value={userForm.yearOfStudy}
                      onChange={handleUserFormChange}
                      className="mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Primary Category</label>
                    <input
                      name="primaryCategory"
                      value={userForm.primaryCategory}
                      onChange={handleUserFormChange}
                      className="mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Skills (comma separated)</label>
                    <input
                      name="skills"
                      value={userForm.skills}
                      onChange={handleUserFormChange}
                      className="mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Phone</label>
                    <input
                      name="phone"
                      value={userForm.phone}
                      onChange={handleUserFormChange}
                      className="mt-1 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={closeUserModal}>
                Close
              </Button>
              {modalMode === 'edit' && (
                <>
                  <Button variant="danger" onClick={handleDeleteUser} disabled={userActionLoading}>
                    Delete
                  </Button>
                  <Button variant="primary" onClick={handleSaveUser} disabled={userActionLoading}>
                    Save Changes
                  </Button>
                </>
              )}
              {modalMode === 'create' && (
                <Button variant="primary" onClick={handleCreateUser} disabled={userActionLoading}>
                  Create User
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
