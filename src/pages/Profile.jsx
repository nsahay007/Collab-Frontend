import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import ThemeSwitch from '../components/common/ThemeSwitch'
import { getUserProjects, getProfile, updateProfile, getRank } from '../features/user/userAPI'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../features/notifications/notificationAPI'

const statusLabel = (status) => {
  if (!status) return 'Planning'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const statusVariant = (status) => {
  if (status === 'completed' || status === 'validated') return 'success'
  if (status === 'building' || status === 'planning') return 'primary'
  if (status === 'archived') return 'default'
  return 'default'
}

function ProjectCard({ title, description, status, roles }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
      </div>
      <p className="text-text-secondary text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {roles?.length ? roles.map((role) => (
          <Badge key={role} variant="default">{role}</Badge>
        )) : <span className="text-xs text-text-muted">No roles listed</span>}
      </div>
    </Card>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()
  const [user, setUser] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    course: '',
    yearOfStudy: '',
    skills: [],
    primaryCategory: '',
    showContactToTeam: false
  })
  const [skillsInput, setSkillsInput] = useState('')
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [rankInfo, setRankInfo] = useState({ rank: null, collegeRank: null })
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsError, setNotificationsError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(true)
  const [saveStatus, setSaveStatus] = useState(null)
  const editSectionRef = useRef(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile()
        setUser(data)
        setFormData({
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'user',
          course: data.course || '',
          yearOfStudy: data.yearOfStudy || '',
          skills: data.skills || [],
          primaryCategory: data.primaryCategory || '',
          showContactToTeam: Boolean(data.showContactToTeam)
        })
        setSkillsInput((data.skills || []).join(', '))
        localStorage.setItem('user', JSON.stringify(data))
      } catch (err) {
        console.error('Failed to load profile', err)
        navigate('/login')
      }
    }

    loadProfile()
  }, [navigate])

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true)
        const response = await getUserProjects('all')
        const list = response?.projects || []
        setProjects(list)
      } catch (err) {
        console.error('Failed to load user projects:', err)
        setProjectsError('Unable to load your projects right now.')
      } finally {
        setProjectsLoading(false)
      }
    }

    loadProjects()
  }, [])

  useEffect(() => {
    const loadRank = async () => {
      try {
        const data = await getRank()
        setRankInfo({
          rank: data?.rank || null,
          collegeRank: data?.collegeRank || null
        })
      } catch (err) {
        console.error('Failed to load rank:', err)
      }
    }

    loadRank()
  }, [])

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true)
        const response = await getNotifications()
        setNotifications(response?.notifications || [])
        setUnreadCount(response?.unreadCount || 0)
      } catch (err) {
        console.error('Failed to load notifications:', err)
        setNotificationsError('Unable to load notifications right now.')
      } finally {
        setNotificationsLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all notifications read:', err)
      setNotificationsError('Unable to mark notifications as read.')
    }
  }

  const handleOpenNotification = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationRead(notification._id)
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(prev - 1, 0))
      }
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
    } catch (err) {
      console.error('Failed to open notification:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const openEdit = () => {
    setSaveStatus(null)
    setEditMode(true)
    requestAnimationFrame(() => {
      editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const saveProfile = async () => {
    try {
      setSaveStatus(null)
      const parsedSkills = skillsInput
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
      const payload = {
        name: formData.name,
        course: formData.course,
        yearOfStudy: formData.yearOfStudy,
        skills: parsedSkills,
        primaryCategory: formData.primaryCategory,
        showContactToTeam: formData.showContactToTeam
      }
      await updateProfile(payload)
      const updated = { ...user, ...payload, skills: parsedSkills }
      setUser(updated)
      setFormData((prev) => ({ ...prev, skills: parsedSkills }))
      localStorage.setItem('user', JSON.stringify(updated))
      setEditMode(false)
      setSaveStatus({ type: 'success', message: 'Profile updated successfully.' })
    } catch (err) {
      console.error('Failed to update profile', err)
      setSaveStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to update profile right now.'
      })
    }
  }

  const cancelEdit = () => {
    setSaveStatus(null)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      course: user.course || '',
      yearOfStudy: user.yearOfStudy || '',
      skills: user.skills || [],
      primaryCategory: user.primaryCategory || '',
      showContactToTeam: Boolean(user.showContactToTeam)
    })
    setSkillsInput((user.skills || []).join(', '))
    setEditMode(false)
  }

  if (!user) {
    return null
  }

  const activeCount = projects.filter((project) => ['planning', 'building'].includes(project.status)).length
  const validationCount = projects.filter((project) => project.status === 'validation').length

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary to-primary-accent text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name || 'Unnamed User'}</h1>
              <p className="text-white/80">{user.email || 'No email provided'}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="bg-white/20 text-white border border-white/30">
                  {user.role || 'user'}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border border-white/30">
                  Active since {new Date().toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {editMode ? (
              <>
                <Button variant="secondary" onClick={cancelEdit}>Cancel</Button>
                <Button variant="primary" onClick={saveProfile}>Save</Button>
              </>
            ) : (
              <Button variant="secondary" onClick={openEdit}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Profile Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
          <div>
            <div className="text-xs uppercase text-text-muted">College</div>
            <div className="text-text-primary font-medium">{user.college?.name || 'Not set'}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-text-muted">Course</div>
            <div className="text-text-primary font-medium">{user.course || 'Not set'}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-text-muted">Year of Study</div>
            <div className="text-text-primary font-medium">{user.yearOfStudy || 'Not set'}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-text-muted">Primary Interest</div>
            <div className="text-text-primary font-medium">{user.primaryCategory || 'Not set'}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-text-muted">Skills</div>
            <div className="text-text-primary font-medium">
              {(user.skills || []).length ? user.skills.join(', ') : 'Not set'}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{user.points ?? 0}</div>
          <div className="text-text-secondary">Total Points</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {rankInfo.rank ? `#${rankInfo.rank}` : '—'}
          </div>
          <div className="text-text-secondary">Leaderboard Rank</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {rankInfo.collegeRank ? `#${rankInfo.collegeRank}` : '—'}
          </div>
          <div className="text-text-secondary">College Rank</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Badges</h2>
        {(user.badges || []).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <Badge key={badge} variant="primary">{badge}</Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Earn badges by building, collaborating, and validating.</p>
        )}
      </Card>

      {editMode && (
        <Card ref={editSectionRef} className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">Edit profile</h2>
          {saveStatus && (
            <div
              className={`rounded-xl border p-3 text-sm ${
                saveStatus.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-error/40 bg-error/10 text-error'
              }`}
            >
              {saveStatus.message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary">Email</label>
              <input
                name="email"
                value={formData.email}
                disabled
                className="mt-1 block w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary">Course</label>
              <input
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary">Year of Study</label>
              <input
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary">Primary Interest</label>
              <input
                name="primaryCategory"
                value={formData.primaryCategory}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary">Skills (comma separated)</label>
              <input
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
              />
            </div>
          </div>
        </Card>
      )}
      
      <Card className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Preferences</h2>
          <div className="p-4 bg-bg-secondary rounded-xl">
            <ThemeSwitch />
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Contact Us</h2>
        <p className="text-sm text-text-secondary">
          Need help or have feedback? Reach us at
          <span className="text-text-primary font-medium"> helpdesk.collab@gmail.com</span>.
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-card text-text-primary hover:bg-bg-secondary transition-colors"
              aria-label="Toggle notifications"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a2.5 2.5 0 01-4.714 0M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-error text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
              <p className="text-sm text-text-secondary">Stay updated on team activity</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={notifications.length === 0 || unreadCount === 0}
            >
              Mark all as read
            </Button>
          </div>
        </div>

        {showNotifications && (
          <div className="space-y-3">
            {notificationsLoading ? (
              <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-6 text-center text-text-secondary">
                Loading notifications...
              </div>
            ) : notificationsError ? (
              <div className="rounded-xl border border-error/40 bg-error/10 p-6 text-center text-error">
                {notificationsError}
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-6 text-center text-text-secondary">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex flex-col gap-2 rounded-xl border p-4 transition-colors ${
                    notification.isRead
                      ? 'border-border bg-bg-card'
                      : 'border-primary/50 bg-primary/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      <h3 className="text-sm font-semibold text-text-primary">
                        {notification.title}
                      </h3>
                    </div>
                    <span className="text-xs text-text-muted">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{notification.message}</p>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-primary"
                      onClick={() => handleOpenNotification(notification)}
                    >
                      {notification.actionUrl ? 'View' : 'Mark read'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{projects.length}</div>
          <div className="text-text-secondary">Total Projects</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{activeCount}</div>
          <div className="text-text-secondary">Active Collaborations</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{validationCount}</div>
          <div className="text-text-secondary">Validation Tasks</div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">My Projects</h2>
          <Link to="/create">
            <Button variant="primary">New Project</Button>
          </Link>
        </div>
        {projectsLoading ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-8 text-center">
            <h3 className="text-base font-semibold text-text-primary">Loading projects...</h3>
          </div>
        ) : projectsError ? (
          <div className="rounded-xl border border-error/40 bg-error/10 p-6 text-center text-error">
            {projectsError}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-8 text-center">
            <h3 className="text-base font-semibold text-text-primary">No projects yet</h3>
            <p className="text-text-secondary mt-2">Build your first project to start collaborating.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <ProjectCard
                key={project._id || idx}
                title={project.title}
                description={project.shortPitch || project.description || ''}
                status={project.status || 'planning'}
                roles={project.rolesNeeded || []}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 text-center text-xs text-text-muted">
        © {currentYear} Collab. All rights reserved.
      </div>
    </div>
  )
}
