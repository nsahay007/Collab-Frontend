import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { CardSkeleton } from '../components/common/Skeleton'
import useAuth from '../hooks/useAuth'
import { fetchDiscoverProjects } from '../features/projects/projectAPI'
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
                Explore execution-focused ventures on Collab. Expand a card to see goals, progress cues, and what the team needs next.
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
  const stage = normalizeLifecycleStage(project.lifecycleStage || project.status || project.phase)
  const visibility = project.visibility || 'private'
  const ownerId = project.owner?._id || project.owner
  const isOwner = viewerId && ownerId && String(ownerId) === String(viewerId)
  const categoryBadge = pickCategoryBadge(project.category)
  const tags = (project.tags || []).slice(0, 4)

  return (
    <motion.div variants={staggerItem} layout className="w-full min-w-0">
      <motion.button
        type="button"
        onClick={onOpen}
        className="text-left w-full min-w-0 block"
        aria-label={`Open ${project.title || 'startup'} details`}
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
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <Badge variant={getLifecycleVariant(stage)}>{getLifecycleLabel(stage)}</Badge>
                <Badge variant={categoryBadge.variant}>{categoryBadge.label}</Badge>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted overflow-hidden">
              {project.owner?.name && (
                <span className="truncate max-w-[150px]">
                  Founder: <span className="text-text-secondary">{project.owner.name}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-2 shrink-0">
                <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
                <Badge variant={visibilityVariant(visibility)} className="!px-2 !py-0.5 !text-[10px]">
                  {VISIBILITY_LABELS[visibility] || visibility}
                </Badge>
              </span>
              {isOwner && (
                <span className="inline-flex items-center gap-2 shrink-0">
                  <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
                  <Badge variant="innovation" className="!px-2 !py-0.5 !text-[10px]">Your workspace</Badge>
                </span>
              )}
            </div>
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 overflow-hidden">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-bg-secondary border border-border px-2 py-0.5 text-xs text-text-secondary truncate max-w-[120px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.button>
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
  const stage = normalizeLifecycleStage(project.lifecycleStage || project.status || project.phase)
  const visibility = project.visibility || 'private'
  const ownerId = project.owner?._id || project.owner
  const isOwner = viewerId && ownerId && String(ownerId) === String(viewerId)

  const roles = Array.isArray(project.rolesNeeded) ? project.rolesNeeded : []
  const skills = Array.isArray(project.skillsRequired) ? project.skillsRequired : []
  const readiness = typeof project.readinessScore === 'number' ? project.readinessScore : null
  const momentum = project.momentumStatus || ''
  const categoryBadge = pickCategoryBadge(project.category)

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
                  <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Startup details</p>
                  <h2 className="text-2xl font-bold text-text-primary tracking-tight">{project.title || 'Untitled venture'}</h2>
                  {project.shortPitch && (
                    <p className="mt-2 text-text-secondary">{project.shortPitch}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Badge variant={getLifecycleVariant(stage)}>{getLifecycleLabel(stage)}</Badge>
                  <Badge variant={categoryBadge.variant}>{categoryBadge.label}</Badge>
                  <Badge variant={visibilityVariant(visibility)}>{VISIBILITY_LABELS[visibility] || visibility}</Badge>
                  {isOwner && <Badge variant="innovation">Your workspace</Badge>}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-5">
                  {project.description && (
                    <section>
                      <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Overview</p>
                      <p className="text-sm text-text-secondary whitespace-pre-line">{project.description}</p>
                    </section>
                  )}

                  {project.executionPlan && (
                    <section>
                      <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Execution plan</p>
                      <p className="text-sm text-text-secondary whitespace-pre-line line-clamp-6">{project.executionPlan}</p>
                    </section>
                  )}
                </div>

                <aside className="space-y-5">
                  <FounderContactSection owner={project.owner} isProjectOwner={isOwner} />

                  <section className="rounded-2xl border border-border bg-bg-elevated p-4">
                    <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Progress</p>
                    <div className="space-y-2 text-sm">
                      {readiness !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary">Readiness</span>
                          <span className="text-text-primary font-semibold">{Math.round(readiness)}%</span>
                        </div>
                      )}
                      {momentum && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-text-secondary">Momentum</span>
                          <span className="text-text-primary font-medium text-right">{momentum.replace(/_/g, ' ')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">Stage</span>
                        <span className="text-text-primary font-medium">{getLifecycleLabel(stage)}</span>
                      </div>
                    </div>
                  </section>

                  {(roles.length > 0 || skills.length > 0) && (
                    <section className="rounded-2xl border border-border bg-bg-elevated p-4">
                      <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Team needed</p>
                      {roles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {roles.slice(0, 8).map((role) => (
                            <Badge key={role} variant="secondary">{role}</Badge>
                          ))}
                        </div>
                      )}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skills.slice(0, 10).map((skill) => (
                            <Badge key={skill} variant="default">{skill}</Badge>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  <Button variant="secondary" className="w-full" onClick={onClose}>
                    Back to showcase
                  </Button>
                </aside>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
