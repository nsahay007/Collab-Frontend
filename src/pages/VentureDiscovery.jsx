import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { staggerContainer, staggerItem } from '../utils/motion'

export default function VentureDiscovery() {
  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={staggerItem}>
        <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Discover</p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Find builders, teams & ventures</h1>
        <p className="text-text-secondary mt-2 max-w-3xl">
          Explore the ecosystem — discover ambitious builders, forming teams, and startups at every execution stage.
        </p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card hover={false} className="border-primary/20">
          <Badge variant="primary" className="mb-3">Rolling out</Badge>
          <h2 className="text-xl font-semibold text-text-primary">Discovery is expanding</h2>
          <p className="mt-2 text-text-secondary max-w-2xl">
            Public browsing of builders and ventures is launching soon. Until then, create a workspace with your team and execute on the Build tab.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row mt-5">
            <Link to="/build">
              <Button className="w-full sm:w-auto">Open Build</Button>
            </Link>
            <Link to="/create">
              <Button variant="secondary" className="w-full sm:w-auto">New Workspace</Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerContainer} className="grid gap-4 md:grid-cols-3">
        <DiscoverCard
          title="Builders"
          text="Find students by skills, domain interest, and execution track record."
        />
        <DiscoverCard
          title="Teams"
          text="See teams forming around ideas — roles open, momentum visible."
        />
        <DiscoverCard
          title="Startups"
          text="Browse ventures by stage, category, and incubation readiness."
        />
      </motion.div>
    </motion.div>
  )
}

function DiscoverCard({ title, text }) {
  return (
    <motion.div variants={staggerItem}>
      <Card>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary">{text}</p>
      </Card>
    </motion.div>
  )
}
