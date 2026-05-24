import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { staggerContainer, staggerItem } from '../utils/motion'

const PLACEHOLDER_ACTIVITY = [
  { type: 'milestone', title: 'MVP milestone shipped', venture: 'CampusPay', time: '2h ago' },
  { type: 'blocker', title: 'API integration blocked', venture: 'HealthBridge', time: '5h ago' },
  { type: 'launch', title: 'Beta waitlist opened', venture: 'StudySync', time: '1d ago' },
  { type: 'update', title: 'Validation interviews completed', venture: 'EcoCart', time: '2d ago' },
]

const typeVariant = {
  milestone: 'success',
  blocker: 'warning',
  launch: 'primary',
  update: 'accent',
}

export default function Feed() {
  return (
    <motion.div className="max-w-3xl mx-auto space-y-6" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={staggerItem}>
        <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Ecosystem Feed</p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Execution heartbeat</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Milestone posts, blocker updates, launches, and public execution activity from ambitious builders.
        </p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card hover={false} className="border-primary/20">
          <Badge variant="accent" className="mb-3">Coming online</Badge>
          <p className="text-sm text-text-secondary">
            The live feed is rolling out next. For now, continue building in your workspace and track progress on the Build tab.
          </p>
          <Link to="/build" className="inline-block mt-4">
            <Button size="sm">Go to Build</Button>
          </Link>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-3">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Preview</h2>
        {PLACEHOLDER_ACTIVITY.map((item) => (
          <Card key={item.title} hover className="opacity-80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant={typeVariant[item.type] || 'default'} className="mb-2 capitalize">
                  {item.type}
                </Badge>
                <p className="font-medium text-text-primary">{item.title}</p>
                <p className="text-sm text-text-muted mt-1">{item.venture}</p>
              </div>
              <span className="text-xs text-text-muted shrink-0">{item.time}</span>
            </div>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  )
}
