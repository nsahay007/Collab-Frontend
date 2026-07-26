import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { getEventDashboard } from '../features/events/eventAPI'

const dateLabel = (value) => value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'To be announced'
const phaseLabels = {
  REGISTRATIONS_CLOSED: 'Registrations closed',
  HACKATHON_OPEN: 'Hackathon in progress',
  HACKATHON_CLOSED: 'Hackathon completed'
}

export default function HackathonDashboard() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getEventDashboard(slug)
      .then((response) => active && setData(response))
      .catch((requestError) => active && setError(requestError?.response?.data?.message || 'Unable to load this hackathon dashboard.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [slug])

  if (loading) return <p className="text-sm text-text-muted">Loading hackathon dashboard...</p>
  if (error) return (
    <Card hover={false} className="max-w-2xl space-y-4">
      <Badge variant="warning">Participant access required</Badge>
      <h1 className="text-2xl font-bold text-text-primary">This dashboard is for approved hackathon participants.</h1>
      <p className="text-sm text-text-secondary">{error}</p>
      <Link to="/events"><Button size="sm">Back to Events</Button></Link>
    </Card>
  )

  const { hackathon, registration, stages = [], announcements = [], notifications = [], teams = [], leaderboard = [], submission } = data || {}
  const currentStage = registration?.currentStage || hackathon?.activeStage
  const isEliminated = registration?.roundStatus === 'eliminated'
  const canShowResults = hackathon?.phase === 'HACKATHON_CLOSED'

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-border-default bg-bg-secondary p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><Badge variant={hackathon?.phase === 'HACKATHON_OPEN' ? 'success' : 'secondary'}>{phaseLabels[hackathon?.phase] || 'Hackathon'}</Badge>{registration?.teamName && <Badge variant="primary">{registration.teamName}</Badge>}</div>
            <h1 className="mt-3 text-3xl font-bold text-text-primary">{hackathon?.title}</h1>
            {hackathon?.description && <p className="mt-2 max-w-3xl text-sm text-text-secondary">{hackathon.description}</p>}
          </div>
          {hackathon?.brochureUrl && <a href={hackathon.brochureUrl} target="_blank" rel="noopener noreferrer" className="shrink-0"><Button size="sm" variant="secondary">{hackathon.brochureButtonText || 'Rules & Brochure'}</Button></a>}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
          {hackathon?.theme && <span>Theme: {hackathon.theme}</span>}
          {hackathon?.location && <span>Location: {hackathon.location}</span>}
          {hackathon?.startDate && <span>Starts: {dateLabel(hackathon.startDate)}</span>}
          {hackathon?.endDate && <span>Ends: {dateLabel(hackathon.endDate)}</span>}
        </div>
      </section>

      {isEliminated && <Card hover={false} className="border-warning/30 bg-warning/5">
        <Badge variant="warning">Round result</Badge>
        <h2 className="mt-3 text-xl font-bold text-text-primary">Your team did not qualify for the next round.</h2>
        <p className="mt-2 text-sm text-text-secondary">Keep building your startup. The work completed during this event remains part of your venture journey.</p>
        {registration?.project?._id && <Link to={`/project/${registration.project._id}`} className="mt-4 inline-block"><Button size="sm">Continue Building Your Startup</Button></Link>}
      </Card>}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <Card hover={false} className="space-y-4">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Current round</p><h2 className="mt-1 text-xl font-bold text-text-primary">{currentStage?.stageName || 'Round details will be announced soon.'}</h2></div>
          {currentStage?.deadline && <p className="text-sm text-text-secondary">Deadline: {dateLabel(currentStage.deadline)}</p>}
          {currentStage?.description && <p className="text-sm text-text-secondary">{currentStage.description}</p>}
          {currentStage?.instructions && <div className="rounded-xl border border-border-default bg-bg-main p-4"><p className="text-sm font-medium text-text-primary">Submission instructions</p><p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{currentStage.instructions}</p></div>}
          {currentStage?.submissionRequired && <p className="text-sm text-text-secondary">Submission status: <span className="font-medium text-text-primary">{submission?.submissionStatus || 'Not submitted'}</span></p>}
        </Card>

        <Card hover={false} className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Your team</p>
          <h2 className="text-xl font-bold text-text-primary">{registration?.teamName || registration?.project?.title || 'Hackathon team'}</h2>
          <p className="text-sm text-text-secondary">Project: {registration?.project?.title || 'Linked project'}</p>
          <p className="text-sm text-text-secondary">Team lead: {registration?.teamLead?.name || registration?.project?.owner?.name || 'To be confirmed'}</p>
          <p className="text-sm text-text-secondary">Members: {(registration?.registeredUsers || registration?.project?.teamMembers || []).map((member) => member.name).filter(Boolean).join(', ') || 'No members listed'}</p>
          <p className="text-sm text-text-secondary">Qualification: <span className="font-medium text-text-primary">{registration?.roundStatus || 'active'}</span></p>
          {registration?.project?._id && <Link to={`/project/${registration.project._id}`}><Button size="sm" variant="secondary">Open Linked Startup</Button></Link>}
        </Card>
      </div>

      <Card hover={false}>
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Timeline</p><h2 className="mt-1 text-xl font-bold text-text-primary">Event rounds</h2></div><span className="text-sm text-text-muted">{stages.length} rounds</span></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{stages.map((stage) => <div key={stage._id} className={`rounded-xl border p-4 ${currentStage?._id === stage._id ? 'border-primary bg-primary/5' : 'border-border-default bg-bg-main'}`}><p className="font-semibold text-text-primary">{stage.order}. {stage.stageName}</p><p className="mt-1 text-sm text-text-secondary">{stage.description || 'Details will be shared by the organizers.'}</p><p className="mt-3 text-xs text-text-muted">{dateLabel(stage.deadline)}</p></div>)}</div>
        {!stages.length && <p className="mt-4 text-sm text-text-muted">The event timeline will be published soon.</p>}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card hover={false}><p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Announcements</p><h2 className="mt-1 text-xl font-bold text-text-primary">Event notifications</h2><div className="mt-4 space-y-3">{announcements.map((item) => <div key={item._id} className="rounded-xl border border-border-default bg-bg-main p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-text-primary">{item.title}</p><Badge variant="secondary">{item.priority || 'normal'}</Badge></div><p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{item.message}</p><p className="mt-2 text-xs text-text-muted">{dateLabel(item.createdAt)}</p></div>)}{!announcements.length && <p className="text-sm text-text-muted">No announcements yet.</p>}</div>{notifications.length > 0 && <p className="mt-4 text-xs text-text-muted">{notifications.length} event notification{notifications.length === 1 ? '' : 's'} recorded in your notification center.</p>}</Card>
        <Card hover={false}><p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Participating teams</p><h2 className="mt-1 text-xl font-bold text-text-primary">Event community</h2><div className="mt-4 space-y-3">{teams.map((team) => <div key={team._id} className="rounded-xl border border-border-default bg-bg-main p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-text-primary">{team.teamName}</p><p className="text-sm text-text-secondary">{team.projectName}</p></div><Badge variant="secondary">{team.status}</Badge></div><p className="mt-2 text-xs text-text-muted">{team.college || 'College not shared'} · {team.currentRound}</p></div>)}{!teams.length && <p className="text-sm text-text-muted">Participating teams will appear here once confirmed.</p>}</div></Card>
      </div>

      {((hackathon?.sponsors || []).length > 0 || (hackathon?.judges || []).length > 0 || (hackathon?.mentors || []).length > 0) && <Card hover={false}><p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Event network</p><h2 className="mt-1 text-xl font-bold text-text-primary">People and partners</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{(hackathon?.sponsors || []).length > 0 && <div><p className="text-sm font-medium text-text-primary">Sponsors</p><p className="mt-1 text-sm text-text-secondary">{hackathon.sponsors.join(', ')}</p></div>}{(hackathon?.judges || []).length > 0 && <div><p className="text-sm font-medium text-text-primary">Judges</p><p className="mt-1 text-sm text-text-secondary">{hackathon.judges.map((person) => person.name).filter(Boolean).join(', ')}</p></div>}{(hackathon?.mentors || []).length > 0 && <div><p className="text-sm font-medium text-text-primary">Mentors</p><p className="mt-1 text-sm text-text-secondary">{hackathon.mentors.map((person) => person.name).filter(Boolean).join(', ')}</p></div>}</div></Card>}

      {leaderboard.length > 0 && <Card hover={false}><p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Leaderboard</p><h2 className="mt-1 text-xl font-bold text-text-primary">Current rankings</h2><div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-border-default text-text-muted"><tr><th className="px-3 py-2">Rank</th><th className="px-3 py-2">Team</th><th className="px-3 py-2">Project</th><th className="px-3 py-2">Score</th></tr></thead><tbody>{leaderboard.map((row) => <tr key={row.registrationId} className="border-b border-border-default"><td className="px-3 py-3 font-semibold text-text-primary">#{row.rank}</td><td className="px-3 py-3 text-text-secondary">{row.teamName || 'Hackathon Team'}</td><td className="px-3 py-3 text-text-secondary">{row.project?.title || 'Project'}</td><td className="px-3 py-3 text-text-secondary">{row.totalObtainedMarks}/{row.totalMaximumMarks}</td></tr>)}</tbody></table></div></Card>}

      {canShowResults && <Card hover={false}><p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Results</p><h2 className="mt-1 text-xl font-bold text-text-primary">Winners and awards</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{(hackathon?.awards || []).map((award) => <div key={`${award.title}-${award.project?._id || award.project || ''}`} className="rounded-xl border border-border-default bg-bg-main p-4"><p className="font-semibold text-text-primary">{award.title}</p><p className="mt-1 text-sm text-text-secondary">{award.project?.title || 'To be announced'}</p>{award.note && <p className="mt-2 text-sm text-text-muted">{award.note}</p>}</div>)}</div>{!(hackathon?.awards || []).length && <p className="mt-4 text-sm text-text-muted">Results will be announced soon.</p>}{hackathon?.externalEventUrl && hackathon?.completionVisibility !== 'admin' && <a href={hackathon.externalEventUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block"><Button size="sm">{hackathon.completionButtonText || 'View Event Highlights'}</Button></a>}</Card>}
    </div>
  )
}
