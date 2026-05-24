import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { staggerContainer, staggerItem } from '../utils/motion'

const CATEGORIES = [
  { title: 'Incubators', description: 'Campus and regional pre-incubation programs for student ventures.', tag: 'Programs' },
  { title: 'Grants & Funding', description: 'Non-dilutive capital and innovation grants for early teams.', tag: 'Funding' },
  { title: 'Hackathons', description: 'Build sprints, demo days, and competitive innovation events.', tag: 'Events' },
  { title: 'Competitions', description: 'Pitch contests and startup challenges with mentorship prizes.', tag: 'Growth' },
]

export default function Opportunities() {
  return (
    <motion.div className="max-w-5xl mx-auto space-y-6" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={staggerItem}>
        <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Growth Layer</p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Opportunities</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Incubators, grants, hackathons, and startup programs — curated for teams ready to scale beyond the build phase.
        </p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card hover={false} className="innovation-surface border-secondary/20">
          <Badge variant="innovation" className="mb-3">Launching soon</Badge>
          <p className="text-sm text-text-secondary max-w-2xl">
            Opportunity matching and program applications are in development. Keep executing on Build — readiness unlocks stronger applications.
          </p>
          <Link to="/build" className="inline-block mt-4">
            <Button variant="innovation" size="sm">Back to Build</Button>
          </Link>
        </Card>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.title} variants={staggerItem}>
            <Card>
              <Badge variant="secondary" className="mb-3">{cat.tag}</Badge>
              <h2 className="text-lg font-semibold text-text-primary">{cat.title}</h2>
              <p className="text-sm text-text-secondary mt-2">{cat.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
