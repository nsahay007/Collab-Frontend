import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'

export default function VentureDiscovery() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Coming Soon</p>
        <h1 className="text-3xl font-bold text-text-primary">Find Team Members is not live yet</h1>
        <p className="text-text-secondary mt-2 max-w-3xl">
          Collab&apos;s public launch is focused on existing student startup teams. For now, bring your own team and use Collab to plan, build, validate, and prepare for incubation.
        </p>
      </div>

      <Card hover={false} className="border-primary/25">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge variant="accent">Team Formation Coming Soon</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-text-primary">What you can do today</h2>
            <p className="mt-2 text-text-secondary">
              Create a private startup workspace with your current team, assign responsibilities, track milestones, store validation evidence, and generate incubation-readiness material.
            </p>
          </div>
          <Link to="/create">
            <Button className="w-full lg:w-auto">Create Startup Workspace</Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="No browsing feed"
          text="Collab is not a startup social network. Public discovery is intentionally paused for launch focus."
        />
        <InfoCard
          title="Existing teams first"
          text="The current product guides teams that already have members, roles, and a startup idea."
        />
        <InfoCard
          title="Pipeline over networking"
          text="The priority is execution clarity, validation evidence, and incubation readiness."
        />
      </div>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Suggested next step</h2>
        <p className="text-text-secondary mb-4">
          If your team is ready, create a workspace and start with the planning phase. If you still need members, keep a note of the missing roles and come back when team formation opens.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/dashboard">
            <Button variant="secondary" className="w-full sm:w-auto">Back to Pipeline</Button>
          </Link>
          <Link to="/create">
            <Button className="w-full sm:w-auto">Start Workspace</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

function InfoCard({ title, text }) {
  return (
    <Card hover={false}>
      <h3 className="font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{text}</p>
    </Card>
  )
}
