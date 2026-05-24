import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import BrandLogo from '../components/common/BrandLogo'
import api from '../services/api'
const steps = [
  {
    title: 'Create Startup Workspace',
    description: 'Capture the startup name, problem, users, why it matters, and current team.',
    icon: 'idea',
    accent: 'from-primary/20 to-secondary/30'
  },
  {
    title: 'Plan the Build',
    description: 'Turn the idea into milestones, feature scope, roles, goals, and a simple timeline.',
    icon: 'team',
    accent: 'from-primary/20 to-success/30'
  },
  {
    title: 'Validate & Prepare Incubation',
    description: 'Track progress, organize evidence, and generate readiness material for incubation.',
    icon: 'validate',
    accent: 'from-warning/20 to-secondary/30'
  }
]

const featureSections = [
  {
    title: 'Guided Startup Planning',
    description: 'Help existing student teams turn a raw idea into a clear startup roadmap.',
    bullets: ['Problem clarity', 'Role assignment', 'Milestone planning'],
    accent: 'from-primary/20 to-secondary/10',
    widget: 'team'
  },
  {
    title: 'Simple Execution Tracking',
    description: 'Move from planning to MVP through milestones, blockers, progress logs, and assets.',
    bullets: ['Pipeline progress', 'Build updates', 'Blocker tracking'],
    accent: 'from-warning/20 to-primary/10',
    widget: 'build'
  },
  {
    title: 'Self-Conducted Validation',
    description: 'Guide teams through surveys, interviews, testing, feedback collection, and evidence storage.',
    bullets: ['Validation questions', 'Evidence uploads', 'Feedback learnings'],
    accent: 'from-success/20 to-primary/10',
    widget: 'validation'
  },
  {
    title: 'Incubation Readiness',
    description: 'Generate and organize the material teams need before approaching an incubation center.',
    bullets: ['Startup summary', 'Pitch structure', 'Application packet'],
    accent: 'from-secondary/20 to-primary/10',
    widget: 'collab'
  },
  {
    title: 'Startup Execution Certificates',
    description: 'Create professional proof of contribution for student startup team members.',
    bullets: ['Member role', 'Milestones completed', 'Stage achieved'],
    accent: 'from-primary/20 to-success/10',
    widget: 'gamified'
  }
]

const lifecycleStages = ['Idea', 'Planning', 'Building', 'MVP', 'Validation', 'Incubation Ready']

function SectionHeader({ title, subtitle, align = 'center' }) {
  const alignment = align === 'center' ? 'text-center' : 'text-left'
  return (
    <div className={`${alignment} space-y-3`}>
      <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
        {title}
      </h2>
      <p className="text-base md:text-lg text-text-secondary font-sans max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  )
}

function StepCard({ step }) {
  return (
    <Card className="text-left h-full">
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${step.accent} flex items-center justify-center border border-border`}>
          <StepIcon type={step.icon} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">{step.title}</h3>
          <p className="text-sm text-text-secondary">{step.description}</p>
        </div>
      </div>
    </Card>
  )
}

function StepIcon({ type }) {
  if (type === 'team') {
    return (
      <svg className="h-6 w-6 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11a3 3 0 100-6 3 3 0 000 6zM17 11a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 20a4 4 0 014-4h2M15 16h2a4 4 0 014 4" />
      </svg>
    )
  }
  if (type === 'validate') {
    return (
      <svg className="h-6 w-6 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    )
  }
  return (
    <svg className="h-6 w-6 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 00-3 11.2V17a1 1 0 001 1h4a1 1 0 001-1v-2.8A6 6 0 0012 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
    </svg>
  )
}

function LifecycleSection() {
  return (
    <section className="py-24 bg-bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          title="Startup Lifecycle"
          subtitle="Every startup workspace follows a clear sequence designed for incubation readiness."
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {lifecycleStages.map((stage, index) => (
            <div key={stage} className="rounded-2xl border border-border bg-bg-card px-4 py-5 text-center relative">
              <p className="text-xs text-text-muted mb-1">Stage {index + 1}</p>
              <p className="text-sm font-semibold text-text-primary">{stage}</p>
              {index < lifecycleStages.length - 1 && (
                <span className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-text-muted">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function GlowWidgetCard({ title, meta, accent, children }) {
  return (
    <div className="relative rounded-2xl border border-border bg-bg-card/80 p-4 shadow-card overflow-hidden">
      <div className={`absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-30 blur-2xl`} />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-text-primary">{title}</div>
          {meta && <div className="text-xs text-text-muted">{meta}</div>}
        </div>
        {children}
      </div>
    </div>
  )
}

function GlowWidgets({ type }) {
  if (type === 'team') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlowWidgetCard title="Team Roles" meta="4 assigned" accent="from-primary to-secondary">
          <div className="h-2 w-24 rounded-full bg-primary/60" />
          <div className="h-2 w-36 rounded-full bg-border" />
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="h-2 w-2 rounded-full bg-success" /> Active
          </div>
        </GlowWidgetCard>
        <GlowWidgetCard title="Role Gaps" meta="coming soon" accent="from-success to-primary">
          <div className="space-y-2">
            <div className="h-2 w-28 rounded-full bg-border" />
            <div className="h-2 w-40 rounded-full bg-border" />
          </div>
        </GlowWidgetCard>
      </div>
    )
  }
  if (type === 'build') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlowWidgetCard title="Next Milestone" meta="Building" accent="from-warning to-primary">
          <div className="text-2xl font-semibold text-primary">68%</div>
          <div className="h-2 w-full rounded-full bg-border">
            <div className="h-2 w-2/3 rounded-full bg-warning" />
          </div>
        </GlowWidgetCard>
        <GlowWidgetCard title="Milestones" meta="3/5 done" accent="from-primary to-secondary">
          <div className="space-y-2">
            <div className="h-2 w-24 rounded-full bg-success/70" />
            <div className="h-2 w-32 rounded-full bg-success/40" />
            <div className="h-2 w-28 rounded-full bg-border" />
          </div>
        </GlowWidgetCard>
      </div>
    )
  }
  if (type === 'validation') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlowWidgetCard title="Evidence Logged" meta="12 items" accent="from-warning to-success">
          <div className="text-2xl font-semibold text-warning">12</div>
          <div className="h-2 w-full rounded-full bg-border">
            <div className="h-2 w-4/5 rounded-full bg-success" />
          </div>
        </GlowWidgetCard>
        <GlowWidgetCard title="Recent Learning" meta="2 insights" accent="from-secondary to-primary">
          <div className="space-y-2 text-xs text-text-muted">
            <div className="rounded-lg bg-bg-secondary/60 p-2">“Clear value prop.”</div>
            <div className="rounded-lg bg-bg-secondary/60 p-2">“Tested with users.”</div>
          </div>
        </GlowWidgetCard>
      </div>
    )
  }
  if (type === 'collab') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlowWidgetCard title="Incubation Packet" meta="8/12 ready" accent="from-primary to-secondary">
          <div className="space-y-2">
            <div className="h-2 w-24 rounded-full bg-border" />
            <div className="h-2 w-32 rounded-full bg-border" />
          </div>
        </GlowWidgetCard>
        <GlowWidgetCard title="Pitch Structure" meta="Generated" accent="from-success to-primary">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="h-2 w-2 rounded-full bg-success" /> 7 sections
          </div>
          <div className="h-2 w-36 rounded-full bg-border mt-2" />
        </GlowWidgetCard>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <GlowWidgetCard title="Certificate" meta="ready" accent="from-primary to-secondary">
        <div className="text-2xl font-semibold text-primary">82%</div>
        <div className="text-xs text-text-muted">Startup execution</div>
      </GlowWidgetCard>
      <GlowWidgetCard title="Milestone Proof" meta="live" accent="from-success to-primary">
        <div className="space-y-2">
          <div className="h-2 w-28 rounded-full bg-primary/50" />
          <div className="h-2 w-36 rounded-full bg-success/50" />
          <div className="h-2 w-24 rounded-full bg-warning/50" />
        </div>
      </GlowWidgetCard>
    </div>
  )
}

export default function Landing() {
  const [publicStats, setPublicStats] = useState({
    activeUsers: null,
    totalProjects: null,
    activeUsersWindowDays: 30
  })
  const [statsError, setStatsError] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    let mounted = true
    const loadStats = async () => {
      try {
        const response = await api.get('/public/stats')
        const stats = response?.data?.stats || {}
        if (!mounted) return
        setPublicStats({
          activeUsers: typeof stats.activeUsers === 'number' ? stats.activeUsers : 0,
          totalProjects: typeof stats.totalProjects === 'number' ? stats.totalProjects : 0,
          activeUsersWindowDays: stats.activeUsersWindowDays || 30
        })
      } catch (error) {
        console.warn('Failed to load public stats', error)
        if (mounted) {
          setStatsError(true)
        }
      }
    }
    loadStats()
    return () => {
      mounted = false
    }
  }, [])

  const formatNumber = (value) => {
    if (value === null || value === undefined) return '—'
    return new Intl.NumberFormat().format(value)
  }

  const activeUsersLabel = publicStats.activeUsersWindowDays
    ? `Active student builders (${publicStats.activeUsersWindowDays}d)`
    : 'Active student builders'

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl ambient-drift" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-secondary/12 blur-3xl ambient-drift" style={{ animationDelay: '-8s' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge variant="accent" className="inline-flex">Guided Pre-Incubation Pipeline</Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-text-primary leading-tight tracking-tight">
                From student idea to incubation readiness
              </h1>
              <p className="text-lg text-text-secondary max-w-xl">
                Collab helps existing student startup teams plan, build, validate, document progress, and prepare stronger incubation applications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:flex-wrap">
                <Link to="/register">
                  <Button variant="primary" className="px-8 py-3">Start Pipeline</Button>
                </Link>
                <Link to="/create">
                  <Button variant="secondary" className="px-8 py-3">Create Workspace</Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                <span>Guided planning • Real execution • Incubation-ready documentation</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-text-primary">Sample startup workspace</div>
                  <Badge variant="secondary">Preview</Badge>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">EcoCart</p>
                        <p className="text-xs text-text-muted">Planning • 4 team members</p>
                      </div>
                      <Badge variant="secondary">Example</Badge>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-border">
                      <div className="h-2 w-2/3 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">CampusPay</p>
                        <p className="text-xs text-text-muted">Validation • 3 team members</p>
                      </div>
                      <Badge variant="secondary">Preview</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="text-xs text-text-muted">8 interviews</span>
                      <span className="text-xs text-text-muted">4 evidence files</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <LifecycleSection />

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            title="How It Works"
            subtitle="From startup intent to incubation-ready output in three execution-focused moves."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StepCard step={step} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature zig-zag */}
      <section className="py-20 bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          {featureSections.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col lg:flex-row gap-10 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="accent" className="mb-3">Feature</Badge>
                <h3 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-text-secondary mb-4 max-w-xl">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.bullets.map((bullet) => (
                    <Badge key={bullet} variant="secondary">{bullet}</Badge>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full"
              >
                <GlowWidgets type={feature.widget} />
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Live platform preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            title="Live Execution Preview"
            subtitle="A quick look at your startup pipeline control center once execution begins."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-10"
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-2xl border border-border bg-bg-secondary/60 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-muted">Student Startup</p>
                        <h4 className="text-xl font-semibold text-text-primary">SkillBridge</h4>
                      </div>
                      <Badge variant="primary">Planning</Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-3">A campus team organizing its problem, build plan, validation evidence, and incubation packet.</p>
                    <div className="mt-4 flex gap-2">
                      <Badge variant="secondary">Problem</Badge>
                      <Badge variant="secondary">MVP Scope</Badge>
                      <Badge variant="secondary">Team Roles</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border bg-bg-card p-4">
                      <p className="text-xs text-text-muted">Build progress</p>
                      <div className="mt-3 h-2 rounded-full bg-border">
                        <div className="h-2 w-1/2 rounded-full bg-primary" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-bg-card p-4">
                      <p className="text-xs text-text-muted">Validation evidence</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-lg font-semibold text-text-primary">12</span>
                        <span className="text-xs text-text-muted">user conversations logged</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                    <p className="text-xs text-text-muted">Recent build updates</p>
                    <div className="mt-3 space-y-3">
                      <div className="text-sm text-text-secondary">Nishant uploaded prototype screenshots</div>
                      <div className="text-sm text-text-secondary">Anya logged interview notes</div>
                      <div className="text-sm text-text-secondary">Team updated MVP scope</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                    <p className="text-xs text-text-muted">Next milestone</p>
                    <h5 className="mt-2 text-lg font-semibold text-text-primary">User onboarding flow</h5>
                    <p className="text-sm text-text-secondary mt-2">Due in 2 days</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Validation highlight */}
      <section className="py-20 bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            title="Self-Conducted Validation"
            subtitle="Teams collect surveys, interviews, testing proof, and feedback evidence with guided prompts."
          />
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-text-primary mb-4">Guided questions</h4>
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">Who did you speak to?</span>
                    <span className="text-xs text-text-muted">survey/interview</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">Capture exact user segments and where the conversation happened.</p>
                </div>
                <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">What changed after feedback?</span>
                    <span className="text-xs text-text-muted">reflection</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">Turn learning into MVP scope, roadmap, or pivot decisions.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-text-primary mb-4">Validation summary</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Evidence types</span>
                  <span className="text-lg font-semibold text-text-primary">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Validation mode</span>
                  <span className="text-sm font-semibold text-text-primary">Self-conducted</span>
                </div>
                <div className="h-2 rounded-full bg-border">
                  <div className="h-2 w-3/4 rounded-full bg-primary" />
                </div>
                <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                  <p className="text-sm text-text-secondary">Validation evidence flows into the incubation-readiness packet.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            title="Built for student startup teams"
            subtitle="A focused pipeline for teams preparing stronger incubation applications."
          />
          <div className="mt-6 text-center text-xs text-text-muted">
            Live metrics reflect real activity on Collab and are shared to help you understand the progress happening across the platform.
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <div className="text-4xl font-semibold text-primary">
                {statsError ? '—' : formatNumber(publicStats.activeUsers)}
              </div>
              <p className="text-sm text-text-secondary mt-2">{activeUsersLabel}</p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl font-semibold text-primary">
                {statsError ? '—' : formatNumber(publicStats.totalProjects)}
              </div>
              <p className="text-sm text-text-secondary mt-2">Startup workspaces</p>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-semibold text-primary">Coming soon</div>
              <p className="text-sm text-text-secondary mt-2">Find Team Members</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Start Building Today
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Your next startup story starts here. Bring the right people together and ship faster.
            </p>
            <Link to="/register">
              <Button
                variant="primary"
                className="px-8 py-3"
              >
                Start Building
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-text-muted">
          <BrandLogo size="sm" className="mx-auto mb-4 opacity-90" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>© {currentYear} Collab. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <Link to="/legal" className="hover:text-text-primary transition-colors">
              Legal & Policies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
