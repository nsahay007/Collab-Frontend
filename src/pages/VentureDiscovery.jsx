import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import useAuth from '../hooks/useAuth'
import { expressInterest } from '../features/projects/projectAPI'
import { fetchProjectOptions } from '../features/projects/projectAPI'
import { fetchValidationQueue, fetchVentureDiscovery } from '../features/ventures/ventureAPI'
import {
  LINEAR_LIFECYCLE,
  getLifecycleLabel,
  getLifecycleVariant,
  normalizeLifecycleStage
} from '../utils/ventureLifecycle'
import { MOMENTUM_LABELS, MOMENTUM_VARIANTS, formatDate } from '../features/execution/executionUtils'

const DEFAULT_FILTERS = {
  lifecycleStage: 'all',
  category: 'all',
  roles: 'all',
  momentumStatus: 'all',
  minReadiness: ''
}

const CATEGORY_OPTIONS = [
  'Tech & Product',
  'Business & Startup',
  'Design & Creative',
  'Marketing & Content',
  'Services & Operations'
]

export default function VentureDiscovery() {
  const { user } = useAuth()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [options, setOptions] = useState({ categories: [], roles: [] })
  const [ventures, setVentures] = useState([])
  const [validationQueue, setValidationQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [interestState, setInterestState] = useState({})

  const recommended = useMemo(() => (
    [...ventures].sort((a, b) => Number(b.discovery?.matchScore || 0) - Number(a.discovery?.matchScore || 0)).slice(0, 3)
  ), [ventures])

  const loadDiscovery = async (nextFilters = filters) => {
    try {
      setLoading(true)
      setError('')
      const [discoveryData, validationData] = await Promise.all([
        fetchVentureDiscovery(nextFilters),
        fetchValidationQueue().catch(() => ({ projects: [] }))
      ])
      setVentures(discoveryData?.ventures || [])
      setValidationQueue(validationData?.projects || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load venture discovery.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectOptions()
      .then((response) => setOptions(response?.data || response || { categories: [], roles: [] }))
      .catch(() => setOptions({ categories: [], roles: [] }))
    loadDiscovery(DEFAULT_FILTERS)
  }, [])

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    loadDiscovery(next)
  }

  const handleInterest = async (venture) => {
    const projectId = venture?._id || venture?.id
    const userId = user?._id || user?.id
    if (!projectId || !userId) return
    try {
      setInterestState((prev) => ({ ...prev, [projectId]: 'loading' }))
      await expressInterest(projectId, userId)
      setInterestState((prev) => ({ ...prev, [projectId]: 'sent' }))
    } catch (err) {
      setInterestState((prev) => ({ ...prev, [projectId]: err?.response?.data?.message || 'Unable to apply' }))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Venture Discovery</p>
          <h1 className="text-3xl font-bold text-text-primary">Find startup work worth joining</h1>
          <p className="text-text-secondary mt-2 max-w-3xl">
            Browse ventures by lifecycle, roles, readiness, momentum, and validation needs. Discovery is about execution opportunity, not scrolling.
          </p>
        </div>
        <Link to="/create">
          <Button className="w-full lg:w-auto">Create Venture</Button>
        </Link>
      </div>

      <Card hover={false}>
        <div className="grid gap-3 md:grid-cols-5">
          <FilterSelect label="Lifecycle" value={filters.lifecycleStage} onChange={(value) => updateFilter('lifecycleStage', value)}>
            <option value="all">All stages</option>
            {LINEAR_LIFECYCLE.map((stage) => <option key={stage} value={stage}>{getLifecycleLabel(stage)}</option>)}
          </FilterSelect>
          <FilterSelect label="Category" value={filters.category} onChange={(value) => updateFilter('category', value)}>
            <option value="all">All categories</option>
            {(options.categories?.length ? options.categories : CATEGORY_OPTIONS).map((category) => <option key={category} value={category}>{category}</option>)}
          </FilterSelect>
          <FilterSelect label="Role Needed" value={filters.roles} onChange={(value) => updateFilter('roles', value)}>
            <option value="all">All roles</option>
            {(options.roles || []).map((role) => <option key={role} value={role}>{role}</option>)}
          </FilterSelect>
          <FilterSelect label="Momentum" value={filters.momentumStatus} onChange={(value) => updateFilter('momentumStatus', value)}>
            <option value="all">All momentum</option>
            {Object.entries(MOMENTUM_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </FilterSelect>
          <div>
            <label className="text-xs uppercase tracking-wide text-text-muted">Min Readiness</label>
            <input
              value={filters.minReadiness}
              onChange={(event) => updateFilter('minReadiness', event.target.value)}
              placeholder="0-100"
              className="mt-2 w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary"
            />
          </div>
        </div>
      </Card>

      {error && <Card hover={false} className="border-error/30 text-error">{error}</Card>}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">Recommended For You</h2>
        {loading ? (
          <Card hover={false}>Loading matches...</Card>
        ) : recommended.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {recommended.map((venture) => (
              <VentureCard key={venture._id} venture={venture} interestState={interestState} onInterest={handleInterest} compact />
            ))}
          </div>
        ) : (
          <Card hover={false}>No matches yet. Try broadening your filters.</Card>
        )}
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Execution Opportunities</h2>
          {loading ? (
            <Card hover={false}>Loading ventures...</Card>
          ) : ventures.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {ventures.map((venture) => (
                <VentureCard key={venture._id} venture={venture} interestState={interestState} onInterest={handleInterest} />
              ))}
            </div>
          ) : (
            <Card hover={false}>No ventures match these filters yet.</Card>
          )}
        </div>

        <ValidationQueue projects={validationQueue} />
      </section>
    </div>
  )
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-text-muted">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-text-primary"
      >
        {children}
      </select>
    </div>
  )
}

function VentureCard({ venture, interestState, onInterest, compact = false }) {
  const projectId = venture._id || venture.id
  const stage = normalizeLifecycleStage(venture.lifecycleStage)
  const matchScore = Number(venture.discovery?.matchScore || 0)
  const interest = interestState[projectId]

  return (
    <Card hover={false}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{venture.title}</h3>
          <p className="text-sm text-text-secondary mt-1">{venture.shortPitch || venture.description}</p>
        </div>
        <Badge variant={getLifecycleVariant(stage)}>{getLifecycleLabel(stage)}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="accent">{matchScore}% match</Badge>
        <Badge variant={MOMENTUM_VARIANTS[venture.momentumStatus] || 'default'}>
          {MOMENTUM_LABELS[venture.momentumStatus] || 'Need Contributors'}
        </Badge>
        <Badge variant="default">{venture.readinessScore || 0}% ready</Badge>
      </div>
      {!compact && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniMetric label="Open roles" value={venture.discovery?.neededSlots ?? 0} />
          <MiniMetric label="Milestones" value={venture.discovery?.milestoneSummary?.total ?? 0} />
          <MiniMetric label="Activity" value={venture.discovery?.activitySummary?.total ?? 0} />
        </div>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link to={`/project/${projectId}`}>
          <Button variant="secondary" size="sm" className="w-full sm:w-auto">Open Workspace</Button>
        </Link>
        <Button size="sm" onClick={() => onInterest(venture)} disabled={interest === 'loading' || interest === 'sent'} className="w-full sm:w-auto">
          {interest === 'loading' ? 'Applying...' : interest === 'sent' ? 'Interest Sent' : 'Join Build'}
        </Button>
      </div>
      {interest && !['loading', 'sent'].includes(interest) && <p className="mt-2 text-xs text-warning">{interest}</p>}
    </Card>
  )
}

function ValidationQueue({ projects }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-text-primary">Validation Queue</h2>
      <Card hover={false}>
        <p className="text-sm text-text-secondary mb-4">
          Review ventures that need structured market feedback and evidence-based validation.
        </p>
        <div className="space-y-3">
          {projects.length > 0 ? projects.slice(0, 6).map((project) => (
            <div key={project._id} className="rounded-xl border border-border bg-bg-secondary/40 p-3">
              <h3 className="text-sm font-semibold text-text-primary">{project.title}</h3>
              <p className="text-xs text-text-muted mt-1">
                {project.validation?.currentReviews || 0}/{project.validation?.reviewsRequired || 30} reviews · updated {formatDate(project.updatedAt)}
              </p>
              <Link to={`/project/${project._id}/validation/review`} className="mt-3 inline-block">
                <Button size="xs" variant="secondary">Give Structured Feedback</Button>
              </Link>
            </div>
          )) : (
            <p className="text-sm text-text-secondary">No ventures currently need validation.</p>
          )}
        </div>
      </Card>
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary/40 px-3 py-2">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-lg font-semibold text-text-primary">{value}</p>
    </div>
  )
}
