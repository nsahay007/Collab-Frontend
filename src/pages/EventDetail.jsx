import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { getEventDetails } from '../features/events/eventAPI'

const displayDate = (value) => value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'To be announced'
const phaseLabel = (phase) => ({ COMING_SOON: 'Coming Soon', REGISTRATIONS_OPEN: 'Registrations Open', REGISTRATIONS_CLOSED: 'Registrations Closed', EVENT_STARTED: 'Event Started', EVENT_ENDED: 'Event Ended' }[phase] || 'Coming Soon')

export default function EventDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getEventDetails(id).then((response) => active && setData(response)).catch((requestError) => active && setError(requestError?.response?.data?.message || 'Unable to load this event.'))
    return () => { active = false }
  }, [id])

  if (error) return <Card hover={false}><h1 className="text-2xl font-bold text-text-primary">Event unavailable</h1><p className="mt-2 text-sm text-text-secondary">{error}</p><Link to="/events" className="mt-4 inline-block"><Button size="sm">Back to Events</Button></Link></Card>
  if (!data) return <p className="text-sm text-text-muted">Loading event...</p>

  const { event } = data
  const showWinners = event.phase === 'EVENT_ENDED'
  return <div className="mx-auto max-w-6xl space-y-6">
    <section className="overflow-hidden rounded-2xl border border-border-default bg-bg-secondary">
      <div className="h-52 bg-gradient-to-br from-primary/30 via-bg-main to-secondary/20">{event.banner && <img src={event.banner} alt={`${event.title} banner`} className="h-full w-full object-cover" />}</div>
      <div className="p-5 sm:p-8">
        <Badge variant={event.registrationOpen ? 'success' : 'secondary'}>{phaseLabel(event.phase)}</Badge>
        <h1 className="mt-3 text-3xl font-bold text-text-primary">{event.title}</h1>
        {event.description && <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-text-secondary">{event.description}</p>}
        <div className="mt-5 flex flex-wrap gap-2"><Link to="/events"><Button size="sm" variant="secondary">All Events</Button></Link>{event.registrationOpen && event.registrationUrl && <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"><Button size="sm">{event.registrationButtonText || 'Register Now'}</Button></a>}</div>
      </div>
    </section>
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-5">
        {event.eligibility && <Section title="Eligibility"><p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">{event.eligibility}</p></Section>}
        {event.rules && <Section title="Rules"><p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">{event.rules}</p></Section>}
        {event.brochure && <Section title="Brochure"><p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">{event.brochure}</p></Section>}
        {showWinners && <Section title="Winners">{event.awards?.length ? <div className="grid gap-3 sm:grid-cols-2">{event.awards.map((award) => <div key={`${award.title}-${award.teamName}-${award.projectName}`} className="rounded-xl border border-border-default bg-bg-main p-4"><p className="font-semibold text-text-primary">{award.title}</p><p className="mt-2 text-sm text-text-secondary">{award.teamName || 'Team to be announced'}</p><p className="text-xs text-text-muted">{award.projectName || 'Project to be announced'}</p></div>)}</div> : <p className="text-sm text-text-muted">Winners will be announced soon.</p>}</Section>}
      </div>
      <div className="space-y-5">
        <Section title="Event information"><div className="space-y-2 text-sm text-text-secondary"><p>Location: {event.location || 'To be announced'}</p><p>Mode: {event.mode}</p><p>Starts: {displayDate(event.eventStart)}</p><p>Ends: {displayDate(event.eventEnd)}</p><p>Registration ends: {displayDate(event.registrationDeadline)}</p>{event.organizer && <p>Organiser: {event.organizer}</p>}</div></Section>
      </div>
    </div>
  </div>
}

function Section({ title, children }) { return <Card hover={false}><h2 className="text-xl font-bold text-text-primary">{title}</h2><div className="mt-4">{children}</div></Card> }
