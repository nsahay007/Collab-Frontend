import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { getOpportunities, getHackathonDetails } from '../features/opportunities/opportunityAPI'
import { staggerContainer, staggerItem } from '../utils/motion'

const TYPE_LABELS = {
  incubator: 'Incubator',
  grant: 'Grant',
  hackathon: 'Hackathon',
  achievement: 'Achievement'
}

const TYPE_VARIANTS = {
  incubator: 'primary',
  grant: 'success',
  hackathon: 'secondary',
  achievement: 'accent'
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'incubator', label: 'Incubators' },
  { id: 'grant', label: 'Grants' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'achievement', label: 'Achievements' }
]

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([])
  const [status, setStatus] = useState('')
  const [activeHackathon, setActiveHackathon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getOpportunities(activeTab)
        setOpportunities(data?.opportunities || [])
      } catch (err) {
        setOpportunities([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeTab])

  useEffect(() => {
    const hackathonId = new URLSearchParams(window.location.search).get('hackathon')
    if (hackathonId) getHackathonDetails(hackathonId).then(setActiveHackathon).catch(() => {})
  }, [])

  const openHackathon = async (opp) => {
    try {
      setStatus('Opening hackathon...')
      const data = await getHackathonDetails(opp.sourceId)
      setActiveHackathon(data)
      setStatus('')
    } catch (error) {
      setStatus(error?.response?.data?.message || 'Hackathon is not open yet.')
    }
  }

  return (
    <motion.div className="max-w-5xl mx-auto space-y-6" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={staggerItem}>
        <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Growth Layer</p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Opportunities</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Incubators, grants, hackathons, and achievements — curated for teams ready to scale.
        </p>
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {loading && (
        <motion.div variants={staggerItem}>
          <p className="text-text-muted text-sm">Loading opportunities...</p>
        </motion.div>
      )}
      {status && <p className="text-sm text-text-secondary">{status}</p>}
      {activeHackathon && (
        <Card hover={false} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{activeHackathon.hackathon?.title}</h2>
              <p className="text-sm text-text-secondary">Team workspace for {activeHackathon.registration?.project?.title || 'registered project'}.</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setActiveHackathon(null)}>Close</Button>
          </div>
          {activeHackathon.hackathon?.rules && <div className="rounded-xl border border-border-default bg-bg-secondary p-3"><p className="font-medium text-text-primary">Brochure / Rules</p><p className="whitespace-pre-wrap text-sm text-text-secondary">{activeHackathon.hackathon.rules}</p></div>}
          {(activeHackathon.announcements || []).map((item) => <div key={item._id} className="rounded-xl border border-border-default bg-bg-secondary p-3"><p className="font-medium text-text-primary">{item.title}</p><p className="text-sm text-text-secondary">{item.message}</p></div>)}
          {!(activeHackathon.announcements || []).length && <p className="text-sm text-text-muted">No messages yet.</p>}
        </Card>
      )}

      {!loading && opportunities.length === 0 && (
        <motion.div variants={staggerItem}>
          <Card hover={false} className="innovation-surface border-secondary/20">
            <Badge variant="innovation" className="mb-3">Coming soon</Badge>
            <p className="text-sm text-text-secondary max-w-2xl">
              No opportunities listed yet. Check back soon — we are actively adding incubators, grants, and events.
            </p>
          </Card>
        </motion.div>
      )}

      {!loading && opportunities.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {opportunities.map((opp) => (
            <motion.div key={opp._id} variants={staggerItem}>
              <Card className="h-full space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-text-primary">{opp.title}</h2>
                  <Badge variant={TYPE_VARIANTS[opp.type] || 'default'}>
                    {TYPE_LABELS[opp.type] || opp.type}
                  </Badge>
                </div>
                {opp.organization && (
                  <p className="text-xs text-text-muted">{opp.organization}</p>
                )}
                {opp.description && (
                  <p className="text-sm text-text-secondary">{opp.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                  {opp.deadline && (
                    <span>Deadline: <span className="text-text-secondary">{new Date(opp.deadline).toLocaleDateString()}</span></span>
                  )}
                  {opp.prize && (
                    <span>Prize: <span className="text-text-secondary">{opp.prize}</span></span>
                  )}
                  {opp.amount && (
                    <span>Amount: <span className="text-text-secondary">{opp.amount}</span></span>
                  )}
                  {opp.location && (
                    <span>Location: <span className="text-text-secondary">{opp.location}</span></span>
                  )}
                </div>
                {opp.sourceType !== 'hackathon' && opp.applyLink && (
                  <a href={opp.applyLink} target="_blank" rel="noopener noreferrer" className="inline-block"><Button size="sm" variant="primary">Apply Now</Button></a>
                )}
                {opp.sourceType === 'hackathon' && (
                  <div className="space-y-2">
                    <Badge variant={opp.phase === 'HACKATHON_OPEN' ? 'success' : opp.phase === 'REGISTRATIONS_CLOSED' ? 'warning' : 'secondary'}>{opp.phase === 'HACKATHON_OPEN' ? 'Hackathon Open' : opp.phase === 'REGISTRATIONS_CLOSED' ? 'Registrations Closed' : 'Registrations Open'}</Badge>
                    {opp.phase === 'REGISTRATIONS_OPEN' && opp.applyLink && <a href={opp.applyLink} target="_blank" rel="noopener noreferrer" className="inline-block"><Button size="sm" variant="primary">Apply Now</Button></a>}
                    {opp.phase === 'REGISTRATIONS_CLOSED' && <p className="text-sm text-text-muted">Registrations Closed</p>}
                    {opp.phase === 'HACKATHON_OPEN' && <Button size="sm" variant="secondary" onClick={() => openHackathon(opp)}>Open Hackathon</Button>}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
