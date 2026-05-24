import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import ThemeSwitch from '../components/common/ThemeSwitch'
import AnimatedNumber from '../components/common/AnimatedNumber'
import { staggerContainer, staggerItem } from '../utils/motion'
import { getUserProjects, getProfile, updateProfile, getExecutionProfile } from '../features/user/userAPI'
import { deleteProject as deleteVenture } from '../features/projects/projectAPI'
import { setupAdminTwoFactor, confirmAdminTwoFactor, disableAdminTwoFactor } from '../features/auth/authAPI'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../features/notifications/notificationAPI'
import {
  getLifecycleLabel,
  getLifecycleVariant,
  normalizeLifecycleStage
} from '../utils/ventureLifecycle'

function ProjectCard({
  id,
  title,
  description,
  lifecycleStage,
  roles,
  canDelete = false,
  deleting = false,
  onDelete
}) {
  const stage = normalizeLifecycleStage(lifecycleStage)

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <Badge variant={getLifecycleVariant(stage)}>{getLifecycleLabel(stage)}</Badge>
      </div>
      <p className="text-text-secondary text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {roles?.length ? roles.map((role) => (
          <Badge key={role} variant="default">{role}</Badge>
        )) : <span className="text-xs text-text-muted">No roles listed</span>}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {id && (
          <Link to={`/project/${id}`}>
            <Button size="sm" variant="secondary">Open Workspace</Button>
          </Link>
        )}

        {canDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Workspace'}
          </Button>
        )}
      </div>
    </Card>
  )
}

function ExecutionMetric({ label, value, numeric = false, suffix = '' }) {
  const raw = typeof value === 'string' ? parseInt(value, 10) : value
  const isPercent = typeof value === 'string' && value.includes('%')
  const num = Number.isFinite(raw) ? raw : 0

  return (
    <motion.div
      variants={staggerItem}
      className="rounded-xl border border-border bg-bg-secondary/50 px-4 py-3 text-center"
    >
      <div className="text-2xl font-bold text-primary mb-1">
        {numeric || Number.isFinite(raw) ? (
          <AnimatedNumber value={num} suffix={isPercent ? '%' : suffix} />
        ) : (
          value
        )}
      </div>
      <div className="text-xs uppercase tracking-wide text-text-muted">{label}</div>
    </motion.div>
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
    phone: '',
    showContactToTeam: true
  })
  const [skillsInput, setSkillsInput] = useState('')
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [projectActionError, setProjectActionError] = useState('')
  const [deletingProjectId, setDeletingProjectId] = useState('')
  const [executionProfile, setExecutionProfile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsError, setNotificationsError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(true)
  const [saveStatus, setSaveStatus] = useState(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorPending, setTwoFactorPending] = useState(false)
  const [twoFactorQr, setTwoFactorQr] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorMessage, setTwoFactorMessage] = useState('')
  const [twoFactorError, setTwoFactorError] = useState('')
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
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
          phone: data.phone || '',
          showContactToTeam: data.showContactToTeam !== false
        })
        setSkillsInput((data.skills || []).join(', '))
        setTwoFactorEnabled(Boolean(data.twoFactorEnabled))
        setTwoFactorPending(Boolean(data.twoFactorPending))
        localStorage.setItem('user', JSON.stringify(data))
      } catch (err) {
        console.error('Failed to load execution profile', err)
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
        console.error('Failed to load startup workspaces:', err)
        setProjectsError('Unable to load your startup workspaces right now.')
      } finally {
        setProjectsLoading(false)
      }
    }

    loadProjects()
  }, [])

  useEffect(() => {
    getExecutionProfile()
      .then((data) => setExecutionProfile(data))
      .catch((err) => console.error('Failed to load execution reputation:', err))
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
    setTimeout(() => {
      editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
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
        phone: formData.phone,
        showContactToTeam: formData.showContactToTeam
      }
      await updateProfile(payload)
      const updated = { ...user, ...payload, skills: parsedSkills }
      setUser(updated)
      setFormData((prev) => ({ ...prev, skills: parsedSkills }))
      localStorage.setItem('user', JSON.stringify(updated))
      setEditMode(false)
      setSaveStatus({ type: 'success', message: 'Execution Profile updated successfully.' })
    } catch (err) {
      console.error('Failed to update execution profile', err)
      setSaveStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to update execution profile right now.'
      })
    }
  }

  const handleTwoFactorSetup = async () => {
    setTwoFactorError('')
    setTwoFactorMessage('')
    setTwoFactorLoading(true)
    try {
      const response = await setupAdminTwoFactor()
      setTwoFactorQr(response.data?.qrCodeDataUrl || '')
      setTwoFactorPending(true)
      setTwoFactorMessage(response.data?.message || 'Scan the QR code and confirm the code below.')
    } catch (err) {
      setTwoFactorError(err?.response?.data?.message || 'Unable to start 2FA setup.')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleTwoFactorConfirm = async () => {
    if (!twoFactorCode) {
      setTwoFactorError('Enter the code from your authenticator app.')
      return
    }
    setTwoFactorError('')
    setTwoFactorMessage('')
    setTwoFactorLoading(true)
    try {
      const response = await confirmAdminTwoFactor({ code: twoFactorCode })
      setTwoFactorEnabled(true)
      setTwoFactorPending(false)
      setTwoFactorQr('')
      setTwoFactorCode('')
      setTwoFactorMessage(response.data?.message || 'Two-factor authentication enabled.')
      setUser((prev) => ({ ...prev, twoFactorEnabled: true, twoFactorPending: false }))
    } catch (err) {
      setTwoFactorError(err?.response?.data?.message || 'Unable to confirm 2FA.')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleTwoFactorDisable = async () => {
    if (!twoFactorCode) {
      setTwoFactorError('Enter the code from your authenticator app.')
      return
    }
    setTwoFactorError('')
    setTwoFactorMessage('')
    setTwoFactorLoading(true)
    try {
      const response = await disableAdminTwoFactor({ code: twoFactorCode })
      setTwoFactorEnabled(false)
      setTwoFactorPending(false)
      setTwoFactorQr('')
      setTwoFactorCode('')
      setTwoFactorMessage(response.data?.message || 'Two-factor authentication disabled.')
      setUser((prev) => ({ ...prev, twoFactorEnabled: false, twoFactorPending: false }))
    } catch (err) {
      setTwoFactorError(err?.response?.data?.message || 'Unable to disable 2FA.')
    } finally {
      setTwoFactorLoading(false)
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
      phone: user.phone || '',
      showContactToTeam: user.showContactToTeam !== false
    })
    setSkillsInput((user.skills || []).join(', '))
    setEditMode(false)
  }

  if (!user) {
    return null
  }

  const activeCount = projects.filter((project) => {
    const stage = normalizeLifecycleStage(project.lifecycleStage || project.status || project.phase)
    return !['archived', 'incubation_ready'].includes(stage)
  }).length
  const validationCount = projects.filter((project) => {
    const stage = normalizeLifecycleStage(project.lifecycleStage || project.status || project.phase)
    return stage === 'validation' || project.validation?.validationStatus === 'in_review'
  }).length
  const currentUserId = user?.id || user?._id || ''
  const reputation = executionProfile?.reputation || {}

  const handleDeleteVenture = async (project) => {
    const projectId = project?._id || project?.id
    if (!projectId) {
      setProjectActionError('This startup workspace is missing an id and cannot be deleted right now.')
      return
    }

    const confirmed = window.confirm(
      `Delete "${project?.title || 'this startup workspace'}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setProjectActionError('')
      setDeletingProjectId(projectId)
      await deleteVenture(projectId)
      setProjects((prev) => prev.filter((item) => (item._id || item.id) !== projectId))
    } catch (err) {
      setProjectActionError(err?.response?.data?.message || 'Unable to delete this startup workspace right now.')
    } finally {
      setDeletingProjectId('')
    }
  }

  return (
    <div className="space-y-8">
      <Card hover={false} className="bg-gradient-to-r from-primary to-secondary text-white shadow-glow-blue border-primary/20">
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
              <Link to="/settings">
                <Button variant="secondary">Account Settings</Button>
              </Link>
            )}
          </div>
        </div>
        {editMode && (
          <p className="mt-3 text-sm text-white/80">
            Edit mode enabled. Scroll down to update your details.
          </p>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Execution Profile Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
          <div>
            <div className="text-xs uppercase text-text-muted">User ID</div>
            <div className="text-text-primary font-medium truncate">{user.id || user._id || 'Not available'}</div>
          </div>
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

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Execution Reputation</h2>
            <p className="text-sm text-text-secondary mt-1">
              Credibility from shipped milestones, consistency, blocker resolution, and startup progression.
            </p>
          </div>
          <Badge variant="accent">{reputation.executionCredibility ?? 0}% credibility</Badge>
        </div>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ExecutionMetric label="Startup Workspaces" value={reputation.venturesContributedTo ?? projects.length} numeric />
          <ExecutionMetric label="Milestones Completed" value={reputation.milestonesCompleted ?? 0} numeric />
          <ExecutionMetric label="Blockers Resolved" value={reputation.blockerResolutions ?? 0} numeric />
          <ExecutionMetric label="Consistency" value={`${reputation.contributionConsistency ?? 0}%`} />
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExecutionMetric label="Execution Reliability" value={`${reputation.executionReliability ?? 0}%`} />
          <ExecutionMetric label="Team Reliability" value={`${reputation.collaborationQuality ?? 0}%`} />
          <ExecutionMetric label="Progression Impact" value={`${reputation.ventureProgressionImpact ?? 0}%`} />
        </motion.div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">Execution Strengths</h3>
          <div className="flex flex-wrap gap-2">
            {(reputation.strengths || []).length > 0 ? reputation.strengths.map((strength) => (
              <Badge key={strength} variant="success">{strength}</Badge>
            )) : (
              <span className="text-sm text-text-secondary">Start shipping milestones to build visible strengths.</span>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Contribution Timeline</h2>
        {executionProfile?.recentContributions?.length > 0 ? (
          <div className="space-y-3">
            {executionProfile.recentContributions.slice(0, 6).map((log) => (
              <div key={log._id} className="rounded-xl border border-border bg-bg-secondary/40 px-4 py-3">
                <p className="text-sm font-semibold text-text-primary">{log.action}</p>
                {log.impact && <p className="text-sm text-text-secondary mt-1">{log.impact}</p>}
                <p className="text-xs text-text-muted mt-2">
                  {log.projectId?.title || 'Startup'} · {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Contribution history appears as you log execution updates and complete milestones.</p>
        )}
      </Card>

      {false && editMode && (
        <div ref={editSectionRef}>
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Edit Execution Profile</h2>
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
              <div>
                <label className="block text-sm font-medium text-text-primary">Phone (optional)</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 …"
                  className="mt-1 block w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                />
              </div>
              <div className="md:col-span-2 rounded-xl border border-border bg-bg-secondary/40 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="showContactToTeam"
                    checked={formData.showContactToTeam}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
                  />
                  <span>
                    <span className="block text-sm font-medium text-text-primary">Show contact on Discover</span>
                    <span className="block text-xs text-text-secondary mt-1">
                      Share your account email and phone on Discover for College and Public ventures. Private workspaces stay team-only unless you enable this.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {false && <Card className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Preferences</h2>
          <div className="p-4 bg-bg-secondary rounded-xl">
            <ThemeSwitch />
          </div>
        </div>
      </Card>}

      {false && user.role === 'admin' && (
        <Card className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Admin Security</h2>
              <p className="text-sm text-text-secondary">
                Protect your admin account with two-factor authentication (2FA).
              </p>
            </div>
            <Badge variant={twoFactorEnabled ? 'success' : twoFactorPending ? 'primary' : 'default'}>
              {twoFactorEnabled ? '2FA Enabled' : twoFactorPending ? 'Setup Pending' : 'Not Enabled'}
            </Badge>
          </div>

          {(twoFactorError || twoFactorMessage) && (
            <div
              className={`rounded-xl border p-3 text-sm ${
                twoFactorError
                  ? 'border-error/40 bg-error/10 text-error'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              }`}
            >
              {twoFactorError || twoFactorMessage}
            </div>
          )}

          {!twoFactorEnabled && (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <p className="text-sm text-text-secondary">
                  Step 1: Scan the QR code with Google Authenticator, Authy, or any TOTP app.
                  Step 2: Enter the 6‑digit code to confirm.
                </p>
                {!twoFactorQr ? (
                  <Button
                    variant="primary"
                    onClick={handleTwoFactorSetup}
                    disabled={twoFactorLoading}
                  >
                    {twoFactorPending ? 'Regenerate QR' : 'Enable 2FA'}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-border bg-bg-secondary p-4 inline-flex">
                      <img
                        src={twoFactorQr}
                        alt="2FA QR code"
                        className="h-40 w-40 object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="flex-1 rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                      />
                      <Button
                        variant="primary"
                        onClick={handleTwoFactorConfirm}
                        disabled={twoFactorLoading}
                      >
                        Confirm 2FA
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 rounded-xl border border-border bg-bg-secondary p-4 text-sm text-text-secondary">
                <p className="font-semibold text-text-primary mb-2">Why this matters</p>
                <ul className="list-disc ml-5 space-y-2">
                  <li>Stops account takeovers even if a password leaks.</li>
                  <li>Protects admin actions and user data.</li>
                  <li>Required for all admin accounts going forward.</li>
                </ul>
              </div>
            </div>
          )}

          {twoFactorEnabled && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                2FA is active on your admin account. Use your authenticator app to sign in.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="Enter 6-digit code to disable"
                  className="flex-1 rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary"
                />
                <Button
                  variant="secondary"
                  onClick={handleTwoFactorDisable}
                  disabled={twoFactorLoading}
                >
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {false && <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Contact Us</h2>
        <p className="text-sm text-text-secondary">
          Need help or have feedback? Reach us at
          <span className="text-text-primary font-medium"> helpdesk.collab@gmail.com</span>.
        </p>
      </Card>}

      {false && <Card className="space-y-4">
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
      </Card>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{projects.length}</div>
          <div className="text-text-secondary">Startup Workspaces</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{activeCount}</div>
          <div className="text-text-secondary">Active Pipelines</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{validationCount}</div>
          <div className="text-text-secondary">Validation Milestones</div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">My Startup Workspaces</h2>
          <Link to="/create">
            <Button variant="primary">New Workspace</Button>
          </Link>
        </div>
        {projectsLoading ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-8 text-center">
            <h3 className="text-base font-semibold text-text-primary">Loading startup workspaces...</h3>
          </div>
        ) : projectsError ? (
          <div className="rounded-xl border border-error/40 bg-error/10 p-6 text-center text-error">
            {projectsError}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-8 text-center">
            <h3 className="text-base font-semibold text-text-primary">No startup workspaces yet</h3>
            <p className="text-text-secondary mt-2">Create your first workspace to start the guided pipeline.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projectActionError && (
              <div className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                {projectActionError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, idx) => {
              const ownerId = project?.owner?._id || project?.owner?.id || project?.owner
              const canDelete = Boolean(currentUserId && ownerId && String(ownerId) === String(currentUserId))
              const projectId = project?._id || project?.id

              return (
                <ProjectCard
                  key={projectId || idx}
                  id={projectId}
                  title={project.title}
                  description={project.shortPitch || project.description || ''}
                  lifecycleStage={project.lifecycleStage || project.status || project.phase}
                  roles={project.rolesNeeded || []}
                  canDelete={canDelete}
                  deleting={deletingProjectId === projectId}
                  onDelete={() => handleDeleteVenture(project)}
                />
              )
            })}
            </div>
          </div>
        )}
      </div>

      <Card className="mt-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Legal & Policies</h3>
            <p className="text-sm text-text-secondary mt-1">
              Your ownership and privacy are protected by clear platform policies.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/legal/terms-of-service" className="text-primary hover:underline">Terms</Link>
            <Link to="/legal/privacy-policy" className="text-primary hover:underline">Privacy</Link>
            <Link to="/legal/ip-ownership-policy" className="text-primary hover:underline">IP & Ownership</Link>
            <Link to="/legal/security-policy" className="text-primary hover:underline">Security</Link>
            <Link to="/legal/ecosystem-guidelines" className="text-primary hover:underline">Guidelines</Link>
            <Link to="/legal/dispute-resolution" className="text-primary hover:underline">Disputes</Link>
          </div>
        </div>
      </Card>

      <div className="pt-6 text-center text-xs text-text-muted">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>© {currentYear} Collab. All rights reserved.</span>
          <span className="hidden sm:inline">•</span>
          <Link to="/legal" className="hover:text-text-primary transition-colors">
            Legal & Policies
          </Link>
        </div>
      </div>
    </div>
  )
}
