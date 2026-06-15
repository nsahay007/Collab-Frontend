import React, { useEffect, useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import ThemeSwitch from '../components/common/ThemeSwitch'
import { getProfile, updateProfile } from '../features/user/userAPI'
import { getNotifications, markAllNotificationsRead } from '../features/notifications/notificationAPI'

export default function Settings() {
  const [form, setForm] = useState({
    name: '',
    course: '',
    yearOfStudy: '',
    primaryCategory: '',
    phone: '',
    skills: '',
    showContactToTeam: true
  })
  const [notifications, setNotifications] = useState([])
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProfile().then((user) => {
      setForm({
        name: user.name || '',
        course: user.course || '',
        yearOfStudy: user.yearOfStudy || '',
        primaryCategory: user.primaryCategory || '',
        phone: user.phone || '',
        skills: (user.skills || []).join(', '),
        showContactToTeam: user.showContactToTeam !== false
      })
    })
    getNotifications().then((data) => setNotifications(data?.notifications || [])).catch(() => {})
  }, [])

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const save = async () => {
    setSaving(true)
    setStatus('')
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean)
      }
      await updateProfile(payload)
      setStatus('Settings saved.')
    } catch (error) {
      setStatus(error?.response?.data?.message || 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  const markRead = async () => {
    await markAllNotificationsRead()
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Account Settings</p>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="mt-2 text-text-secondary">Manage account details, preferences, notifications, and privacy.</p>
      </div>

      <Card hover={false} className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Account</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Name" />
          <Input value={form.course} onChange={(e) => update('course', e.target.value)} placeholder="Course" />
          <Input value={form.yearOfStudy} onChange={(e) => update('yearOfStudy', e.target.value)} placeholder="Year of study" />
          <Input value={form.primaryCategory} onChange={(e) => update('primaryCategory', e.target.value)} placeholder="Primary interest" />
          <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Phone" />
          <Input value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="Skills, comma separated" />
        </div>
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
        {status && <p className="text-sm text-text-secondary">{status}</p>}
      </Card>

      <Card hover={false} className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Preferences</h2>
        <ThemeSwitch />
      </Card>

      <Card hover={false} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
          <Button variant="secondary" size="sm" onClick={markRead} disabled={!notifications.some((item) => !item.isRead)}>
            Mark all read
          </Button>
        </div>
        <p className="text-sm text-text-secondary">{notifications.length} recent notifications.</p>
      </Card>

      <Card hover={false} className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Privacy</h2>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.showContactToTeam}
            onChange={(e) => update('showContactToTeam', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
          />
          <span>
            <span className="block text-sm font-medium text-text-primary">Show contact details to startup teams</span>
            <span className="block text-xs text-text-secondary mt-1">Disable this if you want your contact details hidden outside your private workspaces.</span>
          </span>
        </label>
      </Card>
    </div>
  )
}
