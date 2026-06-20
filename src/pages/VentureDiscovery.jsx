import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { CardSkeleton } from '../components/common/Skeleton'
import useAuth from '../hooks/useAuth'
import { applyToProjectTeam, fetchDiscoverProjects } from '../features/projects/projectAPI'
import { staggerContainer, staggerItem } from '../utils/motion'
import {
  getLifecycleLabel,
  getLifecycleVariant,
  normalizeLifecycleStage
} from '../utils/ventureLifecycle'

const CATEGORY_BADGES = {
  'Tech & Product': { label: 'Tech', variant: 'primary' },
  'Business & Startup': { label: 'Business', variant: 'secondary' },
  'Design & Creative': { label: 'Design', variant: 'accent' },
  'Marketing & Content': { label: 'Marketing', variant: 'secondary' },
  'Services & Operations': { label: 'Ops', variant: 'default' }
}

const VISIBILITY_LABELS = {
  global: 'Public',
  college: 'College',
  private: 'Private'
}

function visibilityVariant(visibility) {
  if (visibility === 'global') return 'success'
  if (visibility === 'college') return 'secondary'
  return 'default'
}

function pickCategoryBadge(category) {
  const badge = CATEGORY_BADGES[category]
  if (badge) return badge
  if (!category) return { label: 'Startup', variant: 'default' }
  return { label: category, variant: 'default' }
}

export default function VentureDiscovery() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const viewerId = user?.id || user?._id || ''

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('active')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchDiscoverProjects({ lifecycleStage: 'all', limit: 50, page: 1 })
      setProjects(Array.isArray(data?.projects) ? data.projects : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load ventures. Please try again.')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const onlyPrivateVisible = useMemo(
    () => projects.length > 0 && projects.every((p) => p.visibility === 'private'),
    [projects]
  )

  const selectedProject = useMemo(
    () => (selectedId ? projects.find((p) => p._id === selectedId) : null),
    [projects, selectedId]
  )

  const activeProjects = useMemo(() => projects.filter((p) => p.lifecycleStage !== 'incubation_ready'), [projects])
  const completedProjects = useMemo(() => projects.filter((p) => p.lifecycleStage === 'incubation_ready'), [projects])

  const filteredProjects = useMemo(() => {
    return filter === 'active' ? activeProjects : completedProjects
  }, [filter, activeProjects, completedProjects])

  const projectCountLabel = useMemo(() => {
    const count = filteredProjects.length
    if (count === 0) return filter === 'active' ? 'No active ventures yet' : 'No completed ventures yet'
    if (count === 1) return filter === 'active' ? '1 active venture' : '1 completed venture'
    return filter === 'active' ? `${count} active ventures` : `${count} completed ventures`
  }, [filteredProjects.length, filter])

  const closeExpanded = useCallback(() => setSelectedId(null), [])

  return (
    <LayoutGroup>
      <motion.div
        className="max-w-6xl mx-auto space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem} className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-text-muted">Discover</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Startup showcase</h1>
              <p className="text-text-secondary mt-2 max-w-2xl">
                Explore public startup previews on Collab. Discover only shows startup names and one-line descriptions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">{projectCountLabel}</Badge>
              <Button variant="secondary" size="sm" onClick={loadProjects}>Refresh</Button>
              <Button size="sm" onClick={() => navigate('/create')}>New workspace</Button>
            </div>
          </div>
        </motion.div>

        {onlyPrivateVisible && !loading && !error && (
          <motion.div variants={staggerItem}>
            <Card hover={false} className="border-warning/30 bg-warning/5">
              <p className="text-sm text-text-secondary">
                Everything currently listed is <strong className="text-text-primary">private</strong>, so only owners and team members can discover it.
                If you want your venture to appear for others, change visibility to College or Public in the workspace settings.
              </p>
            </Card>
          </motion.div>
        )}

        {loading && (
          <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading startups">
            <CardSkeleton lines={4} />
            <CardSkeleton lines={4} />
            <CardSkeleton lines={4} className="hidden md:block" />
            <CardSkeleton lines={4} className="hidden md:block" />
          </div>
        )}

        {!loading && error && (
          <motion.div variants={staggerItem}>
            <Card hover={false} className="border-error/30">
              <h2 className="text-lg font-semibold text-text-primary">Unable to load Discover</h2>
              <p className="text-text-secondary mt-2 mb-4">{error}</p>
              <Button onClick={loadProjects}>Retry</Button>
            </Card>
          </motion.div>
        )}

        {!loading && !error && projects.length === 0 && (
          <motion.div variants={staggerItem}>
            <Card hover={false} elevated className="innovation-surface border-border">
              <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Startup showcase ecosystem</p>
              <h2 className="text-xl font-semibold text-text-primary">No active projects discovered yet</h2>
              <p className="mt-2 text-sm text-text-secondary max-w-xl">
                Execution-focused workspaces from builders will appear here. Start a venture, publish your execution plan, and invite contributors.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row mt-5">
                <Button onClick={() => navigate('/create')}>Create a workspace</Button>
                <Button variant="secondary" onClick={() => navigate('/build')}>Open Build</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {!loading && !error && projects.length > 0 && (
          <motion.div variants={staggerItem} className="flex items-center gap-2">
            <Button
              variant={filter === 'active' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active ({activeProjects.length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed ({completedProjects.length})
            </Button>
          </motion.div>
        )}

        {!loading && !error && projects.length > 0 && filteredProjects.length > 0 && (
          <motion.div variants={staggerContainer} className="grid gap-4 md:grid-cols-2">
            {filteredProjects.map((project) => (
              <DiscoverCard
                key={project._id}
                project={project}
                viewerId={viewerId}
                onOpen={() => setSelectedId(project._id)}
              />
            ))}
          </motion.div>
        )}

        {!loading && !error && projects.length > 0 && filteredProjects.length === 0 && (
          <motion.div variants={staggerItem}>
            <Card hover={false} className="border-border">
              <p className="text-sm text-text-secondary">
                No {filter === 'active' ? 'active' : 'completed'} ventures to display.
              </p>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedProject && (
          <ExpandedVentureModal
            project={selectedProject}
            viewerId={viewerId}
            onClose={closeExpanded}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}

function DiscoverCard({ project, viewerId, onOpen }) {
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [applying, setApplying] = useState(false)
  const apply = async (event) => {
    event.stopPropagation()
    setApplying(true)
    setStatus('')
    try {
      await applyToProjectTeam(project._id, role)
      setStatus('Application sent to the team lead.')
    } catch (err) {
      setStatus(err?.response?.data?.message || 'Could not apply right now.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <motion.div variants={staggerItem} layout className="w-full min-w-0">
      <motion.div
        onClick={onOpen}
        className="text-left w-full min-w-0 block cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onOpen()
        }}
      >
        <motion.div layoutId={`venture-${project._id}`} className="w-full min-w-0">
          <Card className="h-full transition-shadow hover:shadow-glow-blue overflow-hidden" hover={false}>
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1 overflow-hidden">
                <h2 className="text-lg font-semibold text-text-primary truncate">
                  {project.title || 'Untitled venture'}
                </h2>
                {project.shortPitch && (
                  <p className="mt-1 text-sm text-text-secondary line-clamp-2 break-words overflow-hidden w-full">
                    {project.shortPitch}
                  </p>
                )}
              </div>
            </div>
            {project.lookingForTeammates && (
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-3" onClick={(event) => event.stopPropagation()}>
                <p className="text-xs font-semibold text-primary">Find your teammate is open</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder="Role you want to apply for"
                    className="pipeline-input min-w-0 flex-1 text-sm"
                  />
                  <Button size="sm" onClick={apply} disabled={applying || !role.trim()}>
                    {applying ? 'Applying…' : 'Apply'}
                  </Button>
                </div>
                {status && <p className="mt-2 text-xs text-text-secondary">{status}</p>}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function FounderContactSection({ owner, isProjectOwner }) {
  const founderRole = owner?.founderRole || 'Startup Founder'
  const hasEmail = Boolean(owner?.email)
  const hasPhone = Boolean(owner?.phone)
  const contactAvailable = Boolean(owner?.contactAvailable || hasEmail || hasPhone)

  return (
    <section className="rounded-2xl border border-border bg-bg-elevated p-4">
      <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Founder</p>
      <p className="text-sm font-semibold text-text-primary">{owner?.name || 'Founder'}</p>
      <p className="mt-1 text-xs text-text-secondary">{founderRole}</p>
      {owner?.primaryCategory && (
        <p className="mt-1 text-xs text-text-muted">{owner.primaryCategory}</p>
      )}

      <p className="text-xs uppercase tracking-wide text-text-muted mt-4 mb-2">Contact</p>
      {contactAvailable ? (
        <div className="space-y-2 text-sm">
          {hasEmail && (
            <a href={`mailto:${owner.email}`} className="block text-primary hover:underline break-all">
              {owner.email}
            </a>
          )}
          {hasPhone && (
            <a href={`tel:${owner.phone}`} className="block text-primary hover:underline">
              {owner.phone}
            </a>
          )}
        </div>
      ) : (
        <p className="text-xs text-text-muted leading-relaxed">
          {isProjectOwner
            ? 'Enable “Show contact on Discover” in your profile, or set the venture visibility to College or Public.'
            : 'Contact is hidden for private ventures, or the founder has not shared contact details yet.'}
        </p>
      )}
    </section>
  )
}

function ExpandedVentureModal({ project, viewerId, onClose }) {
  return (
    <>
      <motion.button
        type="button"
        aria-label="Close expanded venture"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label="Expanded venture view"
        className="fixed inset-0 z-[90] overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="min-h-full flex items-start justify-center px-4 py-10 sm:py-12">
          <motion.div
            layoutId={`venture-${project._id}`}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-[min(92vw,56rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card hover={false} elevated className="border-border">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Startup preview</p>
                  <h2 className="text-2xl font-bold text-text-primary tracking-tight">{project.title || 'Untitled venture'}</h2>
                  {project.shortPitch && (
                    <p className="mt-2 text-text-secondary">{project.shortPitch}</p>
                  )}
                </div>
              </div>
              <Button variant="secondary" className="mt-6 w-full" onClick={onClose}>
                Back to showcase
              </Button>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
