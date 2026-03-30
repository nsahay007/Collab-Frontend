import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import api from '../services/api'
const steps = [
  {
    title: 'Post Idea',
    description: 'Share your startup concept with clear goals and roles needed.',
    icon: 'idea',
    accent: 'from-primary/20 to-primary-accent/30'
  },
  {
    title: 'Build Team',
    description: 'Invite skilled collaborators and align on a 14‑day plan.',
    icon: 'team',
    accent: 'from-primary/20 to-success/30'
  },
  {
    title: 'Validate Project',
    description: 'Get feedback from real users and improve faster.',
    icon: 'validate',
    accent: 'from-warning/20 to-primary-accent/30'
  }
]

const featureSections = [
  {
    title: 'Smart Team Formation',
    description: 'Match with builders who complement your skills and keep teams focused.',
    bullets: ['Role‑based matching', 'Instant join requests', 'Private team chat'],
    accent: 'from-primary/20 to-primary-accent/10',
    widget: 'team'
  },
  {
    title: '14‑Day Build System',
    description: 'Turn ideas into MVPs with a time‑boxed plan and accountability.',
    bullets: ['Automated countdown', 'Activity tracking', 'Milestone focus'],
    accent: 'from-warning/20 to-primary/10',
    widget: 'build'
  },
  {
    title: 'Validation by Real Users',
    description: 'Launch into validation with structured feedback and ratings.',
    bullets: ['Minimum 30 reviews', 'Avg rating threshold', 'Actionable insights'],
    accent: 'from-success/20 to-primary/10',
    widget: 'validation'
  },
  {
    title: 'Cross‑College Collaboration',
    description: 'Find the best teammates beyond your campus while staying relevant.',
    bullets: ['College filters', 'Global visibility', 'Trusted profiles'],
    accent: 'from-primary-accent/20 to-primary/10',
    widget: 'collab'
  },
  {
    title: 'Gamified Progress System',
    description: 'Earn points, badges, and leaderboard rank as you build.',
    bullets: ['Points for progress', 'Badges that matter', 'Public leaderboard'],
    accent: 'from-primary/20 to-success/10',
    widget: 'gamified'
  }
]

function SectionHeader({ title, subtitle, align = 'center' }) {
  const alignment = align === 'center' ? 'text-center' : 'text-left'
  return (
    <div className={`${alignment} space-y-3`}
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      <h2 className="text-3xl md:text-4xl font-semibold text-text-primary">
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
        <GlowWidgetCard title="Role Match" meta="4 matches" accent="from-primary to-primary-accent">
          <div className="h-2 w-24 rounded-full bg-primary/60" />
          <div className="h-2 w-36 rounded-full bg-border" />
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="h-2 w-2 rounded-full bg-success" /> Active
          </div>
        </GlowWidgetCard>
        <GlowWidgetCard title="Join Requests" meta="2 pending" accent="from-success to-primary">
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
        <GlowWidgetCard title="14‑Day Countdown" meta="Day 5" accent="from-warning to-primary">
          <div className="text-2xl font-semibold text-primary">09:14:22</div>
          <div className="h-2 w-full rounded-full bg-border">
            <div className="h-2 w-2/3 rounded-full bg-warning" />
          </div>
        </GlowWidgetCard>
        <GlowWidgetCard title="Milestones" meta="3/5 done" accent="from-primary to-primary-accent">
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
        <GlowWidgetCard title="Live Ratings" meta="Avg 4.3" accent="from-warning to-success">
          <div className="text-2xl font-semibold text-warning">4.3</div>
          <div className="h-2 w-full rounded-full bg-border">
            <div className="h-2 w-4/5 rounded-full bg-success" />
          </div>
        </GlowWidgetCard>
        <GlowWidgetCard title="Recent Feedback" meta="2 new" accent="from-primary-accent to-primary">
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
        <GlowWidgetCard title="College Filter" meta="Same campus" accent="from-primary to-primary-accent">
          <div className="space-y-2">
            <div className="h-2 w-24 rounded-full bg-border" />
            <div className="h-2 w-32 rounded-full bg-border" />
          </div>
        </GlowWidgetCard>
        <GlowWidgetCard title="Global Reach" meta="Open to all" accent="from-success to-primary">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="h-2 w-2 rounded-full bg-success" /> 18 colleges
          </div>
          <div className="h-2 w-36 rounded-full bg-border mt-2" />
        </GlowWidgetCard>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <GlowWidgetCard title="Points" meta="+15" accent="from-primary to-primary-accent">
        <div className="text-2xl font-semibold text-primary">128</div>
        <div className="text-xs text-text-muted">Total points</div>
      </GlowWidgetCard>
      <GlowWidgetCard title="Badges" meta="3 earned" accent="from-success to-primary">
        <div className="flex gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30" />
          <span className="h-8 w-8 rounded-lg bg-success/20 border border-success/30" />
          <span className="h-8 w-8 rounded-lg bg-warning/20 border border-warning/30" />
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
    ? `Active users (${publicStats.activeUsersWindowDays}d)`
    : 'Active users'

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-accent/10" />
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary-accent/20 blur-3xl animate-pulse" />
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge variant="accent" className="inline-flex">Built for student founders</Badge>
              <h1
                className="text-5xl md:text-6xl font-semibold text-text-primary leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Turn Ideas Into Real Startups
              </h1>
              <p className="text-lg text-text-secondary max-w-xl">
                Collab helps you assemble the right team, build fast in 14 days, and validate with real users—before you launch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="primary" className="px-8 py-3">Get Started</Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="secondary" className="px-8 py-3">Explore Projects</Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                <span>Real teams • Real feedback • Real momentum</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-text-primary">Sample build sprint</div>
                  <Badge variant="secondary">Preview</Badge>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">EcoCart</p>
                        <p className="text-xs text-text-muted">Marketplace • 4 members</p>
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
                        <p className="text-xs text-text-muted">Fintech • 3 members</p>
                      </div>
                      <Badge variant="secondary">Preview</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="text-xs text-text-muted">⭐ 4.2</span>
                      <span className="text-xs text-text-muted">31 reviews</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            title="How It Works"
            subtitle="From idea to validated project in three focused steps."
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
        <div className="max-w-7xl mx-auto px-6 space-y-16">
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
                <h3 className="text-3xl font-semibold text-text-primary mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            title="Live Platform Preview"
            subtitle="A quick look at what your workspace feels like once you’re inside."
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
                        <p className="text-sm text-text-muted">Trending Project</p>
                        <h4 className="text-xl font-semibold text-text-primary">SkillBridge</h4>
                      </div>
                      <Badge variant="primary">Open roles</Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-3">Connecting students with micro‑internships from local startups.</p>
                    <div className="mt-4 flex gap-2">
                      <Badge variant="secondary">Frontend</Badge>
                      <Badge variant="secondary">Marketing</Badge>
                      <Badge variant="secondary">Data</Badge>
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
                      <p className="text-xs text-text-muted">Validation votes</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-lg font-semibold text-text-primary">4.3</span>
                        <span className="text-xs text-text-muted">/ 5.0 (28 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                    <p className="text-xs text-text-muted">Recent activity</p>
                    <div className="mt-3 space-y-3">
                      <div className="text-sm text-text-secondary">Nishant uploaded pitch deck</div>
                      <div className="text-sm text-text-secondary">Anya left validation feedback</div>
                      <div className="text-sm text-text-secondary">Team moved to Day 6</div>
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
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            title="Validation by Real Users"
            subtitle="Every project is tested by real students who give candid feedback."
          />
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-text-primary mb-4">Latest feedback</h4>
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">Rating 4 / 5</span>
                    <span className="text-xs text-text-muted">just now</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">Great concept, improve onboarding clarity.</p>
                </div>
                <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">Rating 5 / 5</span>
                    <span className="text-xs text-text-muted">2 hrs ago</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">Loved the flow, feels ready to test on campus.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-text-primary mb-4">Validation summary</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Average rating</span>
                  <span className="text-lg font-semibold text-text-primary">4.1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Reviews required</span>
                  <span className="text-sm font-semibold text-text-primary">30</span>
                </div>
                <div className="h-2 rounded-full bg-border">
                  <div className="h-2 w-3/4 rounded-full bg-primary" />
                </div>
                <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4">
                  <p className="text-sm text-text-secondary">Validated projects appear in the featured list for new collaborators.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            title="Used by students across colleges"
            subtitle="A growing community of builders, designers, and validators."
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
              <p className="text-sm text-text-secondary mt-2">Projects launched</p>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-semibold text-primary">Coming soon</div>
              <p className="text-sm text-text-secondary mt-2">Average validation rating</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-accent to-primary" />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Start Building Today
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Your next startup story starts here. Bring the right people together and ship faster.
            </p>
            <Link to="/register">
              <Button
                variant="secondary"
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 hover:bg-white/20 px-8 py-3"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
