import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Input from '../components/common/Input'
import { getEvents } from '../features/events/eventAPI'

const PAGE_SIZE = 12
const phaseLabel = (event) => ({ REGISTRATIONS_OPEN: 'Registration Open', REGISTRATIONS_CLOSED: 'Registration Closed', HACKATHON_OPEN: 'In Progress', HACKATHON_CLOSED: 'Completed' }[event.phase] || 'Upcoming')
const unique = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [filters, setFilters] = useState({ search: '', country: '', state: '', institute: '', mode: '', status: '', category: '', teamSize: '', date: 'all', from: '', to: '' })

  useEffect(() => {
    let active = true
    getEvents().then((data) => active && setEvents(data?.events || [])).catch((requestError) => active && setError(requestError?.response?.data?.message || 'Unable to load events.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const countries = useMemo(() => unique(events.map((event) => event.country)), [events])
  const states = useMemo(() => unique(events.filter((event) => !filters.country || event.country === filters.country).map((event) => event.state)), [events, filters.country])
  const institutes = useMemo(() => unique(events.map((event) => event.institute)), [events])
  const filteredEvents = useMemo(() => {
    const now = new Date()
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7)
    const monthEnd = new Date(now); monthEnd.setMonth(now.getMonth() + 1)
    return events.filter((event) => {
      const text = [event.title, event.organizer, event.institute, event.city].join(' ').toLowerCase()
      const start = event.eventStart ? new Date(event.eventStart) : null
      const deadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null
      const matchesDate = filters.date === 'all' || (filters.date === 'upcoming' && (!start || start >= now)) || (filters.date === 'week' && start && start >= now && start <= weekEnd) || (filters.date === 'month' && start && start >= now && start <= monthEnd) || (filters.date === 'custom' && (!filters.from || (start && start >= new Date(filters.from))) && (!filters.to || (start && start <= new Date(`${filters.to}T23:59:59`))))
      const matchesStatus = !filters.status || (filters.status === 'open' && event.registrationOpen) || (filters.status === 'closed' && !event.registrationOpen) || (filters.status === 'upcoming' && start && start > now)
      const matchesTeam = !filters.teamSize || (filters.teamSize === 'individual' && event.teamSizeMin === 1 && event.teamSizeMax === 1) || (filters.teamSize === '2-4' && event.teamSizeMin <= 2 && event.teamSizeMax >= 4) || (filters.teamSize === '3-5' && event.teamSizeMin <= 3 && event.teamSizeMax >= 5)
      return (!filters.search || text.includes(filters.search.toLowerCase())) && (!filters.country || event.country === filters.country) && (!filters.state || event.state === filters.state) && (!filters.institute || event.institute === filters.institute) && (!filters.mode || event.mode === filters.mode) && (!filters.category || event.category === filters.category) && matchesStatus && matchesTeam && matchesDate && (!deadline || filters.status !== 'open' || deadline >= now)
    })
  }, [events, filters])

  const update = (field, value) => { setVisible(PAGE_SIZE); setFilters((current) => ({ ...current, [field]: value, ...(field === 'country' ? { state: '' } : {}) })) }
  const reset = () => { setVisible(PAGE_SIZE); setFilters({ search: '', country: '', state: '', institute: '', mode: '', status: '', category: '', teamSize: '', date: 'all', from: '', to: '' }) }

  return <div className="mx-auto max-w-7xl space-y-6">
    <section className="rounded-2xl border border-border-default bg-bg-secondary p-5 sm:p-8"><Badge variant="primary">Collab events</Badge><h1 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">Find your next builder event.</h1><p className="mt-3 max-w-2xl text-sm text-text-secondary">Hackathons, startup competitions, innovation challenges, and Builder&apos;s League events in one focused place.</p></section>
    <Card hover={false} className="space-y-4"><Input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder="Search by event, organizer, institute, or city" aria-label="Search events" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><select className="rounded-xl border border-border-default bg-bg-main p-3 text-sm" value={filters.country} onChange={(event) => update('country', event.target.value)}><option value="">All countries</option>{countries.map((value) => <option key={value}>{value}</option>)}</select><select className="rounded-xl border border-border-default bg-bg-main p-3 text-sm" value={filters.state} onChange={(event) => update('state', event.target.value)}><option value="">All states</option>{states.map((value) => <option key={value}>{value}</option>)}</select><input list="event-institutes" className="rounded-xl border border-border-default bg-bg-main p-3 text-sm" value={filters.institute} onChange={(event) => update('institute', event.target.value)} placeholder="Institute" /><datalist id="event-institutes">{institutes.map((value) => <option key={value} value={value} />)}</datalist><select className="rounded-xl border border-border-default bg-bg-main p-3 text-sm" value={filters.mode} onChange={(event) => update('mode', event.target.value)}><option value="">Any mode</option><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option></select><select className="rounded-xl border border-border-default bg-bg-main p-3 text-sm" value={filters.status} onChange={(event) => update('status', event.target.value)}><option value="">Any registration status</option><option value="open">Open</option><option value="closed">Closed</option><option value="upcoming">Upcoming</option></select><select className="rounded-xl border border-border-default bg-bg-main p-3 text-sm" value={filters.category} onChange={(event) => update('category', event.target.value)}><option value="">Any event category</option>{unique(events.map((event) => event.category)).map((value) => <option key={value}>{value}</option>)}</select><select className="rounded-xl border border-border-default bg-bg-main p-3 text-sm" value={filters.teamSize} onChange={(event) => update('teamSize', event.target.value)}><option value="">Any team size</option><option value="individual">Individual</option><option value="2-4">2-4</option><option value="3-5">3-5</option></select><select className="rounded-xl border border-border-default bg-bg-main p-3 text-sm" value={filters.date} onChange={(event) => update('date', event.target.value)}><option value="upcoming">Upcoming</option><option value="week">This week</option><option value="month">This month</option><option value="all">Any date</option><option value="custom">Custom range</option></select></div>{filters.date === 'custom' && <div className="grid gap-3 sm:grid-cols-2"><Input type="date" value={filters.from} onChange={(event) => update('from', event.target.value)} aria-label="Event start date" /><Input type="date" value={filters.to} onChange={(event) => update('to', event.target.value)} aria-label="Event end date" /></div>}</Card>
    {loading && <p className="text-sm text-text-muted">Loading events...</p>}{error && <Card hover={false}><p className="text-sm text-error">{error}</p></Card>}
    {!loading && !error && filteredEvents.length === 0 && <Card hover={false} className="py-12 text-center"><h2 className="text-xl font-bold text-text-primary">No events match your filters.</h2><p className="mt-2 text-sm text-text-secondary">Try removing one or more filters to discover upcoming builder events.</p><Button className="mt-4" size="sm" variant="secondary" onClick={reset}>Reset Filters</Button></Card>}
    {!loading && filteredEvents.length > 0 && <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredEvents.slice(0, visible).map((event) => <EventCard key={event.id} event={event} />)}</div>{visible < filteredEvents.length && <div className="text-center"><Button variant="secondary" onClick={() => setVisible((count) => count + PAGE_SIZE)}>Show more events</Button></div>}</>}
  </div>
}

function EventCard({ event }) {
  const date = event.eventStart ? new Date(event.eventStart).toLocaleDateString() : 'Dates to be announced'
  return <Card className="flex h-full flex-col overflow-hidden p-0"><div className="relative h-36 bg-gradient-to-br from-primary/30 via-bg-main to-secondary/20">{event.banner && <img src={event.banner} alt={`${event.title} banner`} className="h-full w-full object-cover" loading="lazy" />}<Badge className="absolute right-3 top-3" variant={event.registrationOpen ? 'success' : event.phase === 'HACKATHON_CLOSED' ? 'primary' : 'secondary'}>{phaseLabel(event)}</Badge></div><div className="flex flex-1 flex-col p-5"><p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{event.category}</p><h2 className="mt-2 text-xl font-bold text-text-primary">{event.title}</h2><p className="mt-1 text-sm text-text-secondary">{event.organizer || event.institute || 'Collab event'}</p><p className="mt-3 line-clamp-3 text-sm text-text-secondary">{event.description || 'Event details will be shared by the organizer.'}</p><div className="mt-4 space-y-1 text-xs text-text-muted"><p>{event.city || event.location || 'Location to be announced'} · {event.mode}</p><p>Event date: {date}</p>{event.registrationDeadline && <p>Registration deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</p>}{event.prizes?.length > 0 && <p>Prize pool: {event.prizes.join(', ')}</p>}</div><div className="mt-auto flex flex-wrap gap-2 pt-5"><Link to={`/events/${event.slug || event.id}`}><Button size="sm" variant="secondary">View Event</Button></Link>{event.registrationOpen && event.registrationUrl && <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"><Button size="sm">{event.registrationButtonText || 'Register'}</Button></a>}</div></div></Card>
}
