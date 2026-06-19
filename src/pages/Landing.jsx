import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/common/Button'
import BrandLogo from '../components/common/BrandLogo'
import api from '../services/api'

const chaos = ['WhatsApp groups', 'Discord threads', 'LinkedIn posts', 'College circles', 'Random communities']
const journey = ['Idea', 'Co-founder', 'Team', 'Opportunity', 'Prototype', 'Incubation', 'Startup']
const signals = ['Team formed', 'Venture created', 'Opportunity opened', 'Milestone shipped', 'Mentor found', 'Incubation packet prepared']
const roles = ['Builders', 'Founders', 'Developers', 'Designers', 'Researchers', 'Students', 'Innovators']

const tiltOrbit = (event) => { const box = event.currentTarget.getBoundingClientRect(); const x = event.clientX - box.left - box.width / 2; const y = event.clientY - box.top - box.height / 2; event.currentTarget.style.setProperty('--rx', String((-y / box.height) * 8) + 'deg'); event.currentTarget.style.setProperty('--ry', String((x / box.width) * 10) + 'deg'); event.currentTarget.style.setProperty('--mx', String(x * 0.03) + 'px'); event.currentTarget.style.setProperty('--my', String(y * 0.03) + 'px'); }
const resetOrbit = (event) => { event.currentTarget.style.setProperty('--rx', '0deg'); event.currentTarget.style.setProperty('--ry', '0deg'); event.currentTarget.style.setProperty('--mx', '0px'); event.currentTarget.style.setProperty('--my', '0px'); }

function SectionTitle({ kicker, title, body }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.36em] text-primary">{kicker}</p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-text-primary md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-text-secondary md:text-lg">{body}</p>
    </div>
  )
}

function HeroConstellation() {
  const nodes = [
    ['Idea', 'left-[14%] top-[22%]'], ['Builder', 'left-[56%] top-[12%]'], ['Team', 'left-[76%] top-[36%]'],
    ['Opportunity', 'left-[24%] top-[58%]'], ['Venture', 'left-[52%] top-[48%]'], ['Incubation', 'left-[66%] top-[72%]']
  ]
  return (
    <div className="landing-constellation" onMouseMove={tiltOrbit} onMouseLeave={resetOrbit}>
      <div className="landing-orbit landing-orbit-a" />
      <div className="landing-orbit landing-orbit-b" />
      {nodes.map(([label, pos], index) => (
        <div key={label} className={`landing-node ${pos}`} style={{ animationDelay: `${index * -0.8}s` }}>
          <span>{label}</span>
        </div>
      ))}
      <div className="landing-core">
        <BrandLogo size="md" className="mx-auto" />
        <p>COLLAB</p>
      </div>
    </div>
  )
}

function Metric({ value, label }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <div className="text-3xl font-black text-text-primary">{value}</div>
      <p className="mt-1 text-sm text-text-secondary">{label}</p>
    </div>
  )
}

export default function Landing() {
  const [stats, setStats] = useState({ activeUsers: null, totalProjects: null })
  const year = new Date().getFullYear()

  useEffect(() => {
    let mounted = true
    api.get('/public/stats').then((res) => {
      if (!mounted) return
      const next = res?.data?.stats || {}
      setStats({
        activeUsers: typeof next.activeUsers === 'number' ? next.activeUsers : null,
        totalProjects: typeof next.totalProjects === 'number' ? next.totalProjects : null
      })
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const n = (value) => value === null || value === undefined ? 'Live' : new Intl.NumberFormat().format(value)

  return (
    <div className="landing-ecosystem -mx-4 -my-6 overflow-hidden sm:-mx-6 sm:-my-8">
      <section className="relative min-h-[88vh] px-4 py-20 sm:px-6 lg:py-28">
        <div className="landing-aurora" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-primary">The place where startups begin</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-text-primary md:text-7xl">
              Where ideas find people, momentum, and a way forward.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-text-secondary">
              COLLAB is a living startup ecosystem for innovators to discover opportunities, form teams, join programs, create ventures, and turn raw ambition into real companies.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/register"><Button variant="primary" className="px-8 py-3">Enter the ecosystem</Button></Link>
              <Link to="/opportunities"><Button variant="secondary" className="px-8 py-3">Explore opportunities</Button></Link>
            </div>
          </motion.div>
          <HeroConstellation />
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <SectionTitle kicker="The scattered beginning" title="Innovation should not depend on finding the right group chat." body="Today, builders are spread across noisy channels. COLLAB becomes the connecting layer where people, opportunities, and startup progress finally meet." />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-5">
          {chaos.map((item, index) => (
            <motion.div key={item} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }} className="landing-fragment">
              {item}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <SectionTitle kicker="The founder journey" title="Ideas become teams. Teams become ventures. Ventures become startups." body="The full path is visible from day one, so every builder understands where they are and what comes next." />
        <div className="mx-auto mt-14 max-w-6xl">
          <div className="landing-journey">
            {journey.map((step, index) => (
              <div key={step} className="landing-journey-step">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <SectionTitle kicker="Living ecosystem" title="A platform that feels active before you even join." body="Teams forming, ventures launching, opportunities opening, and milestones moving. COLLAB should feel like a place where progress is already happening." />
        <div className="landing-signal-wrap mx-auto mt-12 max-w-6xl">
          {[0, 1, 2].map((row) => (
            <div key={row} className="landing-signal-row" style={{ animationDelay: `${row * -5}s` }}>
              {[...signals, ...signals].map((signal, index) => <span key={`${row}-${signal}-${index}`}>{signal}</span>)}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <SectionTitle kicker="Who belongs here" title="Every kind of builder has a place in the same orbit." body="Founders, developers, designers, researchers, students, and innovators do not sit in separate silos. They move around the same startup core." />
        <div className="landing-role-orbit mx-auto mt-12" onMouseMove={tiltOrbit} onMouseLeave={resetOrbit}>
          {roles.map((role, index) => <span key={role} style={{ '--i': index }}>{role}</span>)}
          <div>COLLAB</div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-border bg-bg-card/70 p-6 shadow-elevated backdrop-blur md:p-10">
          <SectionTitle kicker="Ecosystem proof" title="Credibility through movement, not testimonials." body="The signal is simple: people are building here." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Metric value={n(stats.activeUsers)} label="active student builders" />
            <Metric value={n(stats.totalProjects)} label="startup workspaces" />
            <Metric value="Open" label="startup programs and opportunities" />
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6">
        <div className="landing-vision mx-auto max-w-6xl">
          <p>COLLAB is infrastructure for student innovation.</p>
          <h2>Every student with an idea should be one connection away from teammates, opportunities, mentors, and startup support.</h2>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="landing-final mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.38em] text-white/70">Join the movement</p>
          <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">Enter the place where builders begin.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">Bring your idea, your ambition, or your curiosity. The ecosystem is already forming.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register"><Button variant="primary" className="px-8 py-3">Join COLLAB</Button></Link>
            <Link to="/login"><Button variant="secondary" className="px-8 py-3">I already belong</Button></Link>
          </div>
        </div>
      </section>

      <footer className="px-4 pb-10 text-center text-xs text-text-muted sm:px-6">
        <BrandLogo size="sm" className="mx-auto mb-4 opacity-90" />
        <span>© {year} Collab. All rights reserved.</span>
      </footer>
    </div>
  )
}
