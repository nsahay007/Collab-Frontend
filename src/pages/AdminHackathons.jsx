import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Input from '../components/common/Input'
import useAuth from '../hooks/useAuth'
import {
  createAdminHackathon,
  createAdminHackathonRegistration,
  approveAdminHackathon,
  archiveAdminHackathon,
  createAdminHackathonAnnouncement,
  createAdminHackathonStage,
  createAdminJudgeReview,
  createAdminStageCriteria,
  deleteAdminHackathonAnnouncement,
  getAdminHackathon,
  getAdminHackathonAnnouncements,
  getAdminHackathonExportData,
  getAdminHackathonCsvUrl,
  getAdminHackathonPdfUrl,
  getAdminHackathonLeaderboard,
  getAdminHackathonRegistrations,
  getAdminHackathonProjectOptions,
  getAdminHackathonReport,
  getAdminHackathons,
  getAdminHackathonStages,
  getAdminHackathonSubmissions,
  getAdminStageCriteria,
  updateAdminHackathon,
  updateAdminHackathonAnnouncement,
  updateAdminHackathonRegistrationStatus,
  updateAdminHackathonStage,
  updateAdminHackathonSubmissionStatus,
  updateAdminStageCriteria
} from '../features/admin/adminHackathonAPI'
import { runAdminRequest } from '../features/admin/adminRequest'

const emptyForm = { title: '', description: '', organizer: '', startDate: '', endDate: '', status: 'published', visibility: 'public' }
const compactDate = (value) => value?.slice?.(0, 10) || ''
const cleanHackathonPayload = (form) => ({
  ...form,
  title: form.title.trim(),
  startDate: form.startDate || undefined,
  endDate: form.endDate || undefined
})

export default function AdminHackathons() {
  const { user } = useAuth()
  const [hackathons, setHackathons] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [details, setDetails] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [projectOptions, setProjectOptions] = useState([])
  const [registrationProjectId, setRegistrationProjectId] = useState('')
  const [projectQuery, setProjectQuery] = useState('')
  const [stages, setStages] = useState([])
  const [criteriaByStage, setCriteriaByStage] = useState({})
  const [leaderboard, setLeaderboard] = useState([])
  const [report, setReport] = useState(null)
  const [exportRows, setExportRows] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')
  const [judgeStageId, setJudgeStageId] = useState('')
  const [judgeRegistrationId, setJudgeRegistrationId] = useState('')
  const [scores, setScores] = useState({})
  const [existingReviewId, setExistingReviewId] = useState('')
  const [status, setStatus] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  const loadList = async () => {
    const data = await runAdminRequest('Loading hackathons', getAdminHackathons, { setStatus, setLoading: setLoadingAction })
    setHackathons(data.hackathons || [])
  }

  const loadProjectOptions = async () => {
    const data = await getAdminHackathonProjectOptions()
    setProjectOptions(data.projects || [])
  }

  const openHackathon = async (id) => {
    try {
      setSelectedId(id)
      const [detail, regs, board, rep, subs, anns, stageData, exportData] = await runAdminRequest('Loading hackathon', () => Promise.all([
        getAdminHackathon(id),
        getAdminHackathonRegistrations(id),
        getAdminHackathonLeaderboard(id),
        getAdminHackathonReport(id),
        getAdminHackathonSubmissions(id),
        getAdminHackathonAnnouncements(id),
        getAdminHackathonStages(id),
        getAdminHackathonExportData(id)
      ]), { setStatus, setLoading: setLoadingAction })
      const loadedStages = stageData.stages || []
      const criteriaPairs = await Promise.all(loadedStages.map(async (stage) => [stage._id, (await getAdminStageCriteria(id, stage._id)).criteria || []]))
      const h = detail.hackathon || {}
      setDetails(h)
      setForm({ ...emptyForm, ...h, startDate: compactDate(h.startDate), endDate: compactDate(h.endDate) })
      setRegistrations(regs.registrations || [])
      setLeaderboard(board.leaderboard || [])
      setReport(rep)
      setSubmissions(subs.submissions || [])
      setAnnouncements(anns.announcements || [])
      setStages(loadedStages)
      setCriteriaByStage(Object.fromEntries(criteriaPairs))
      setExportRows(exportData.rows || [])
      setJudgeStageId(loadedStages[0]?._id || '')
    } catch {
      // status already contains backend error
    }
  }

  const refresh = () => selectedId ? openHackathon(selectedId) : Promise.resolve()
  const run = async (label, fn, payload) => {
    try {
      await runAdminRequest(label, fn, { setStatus, setLoading: setLoadingAction, payload })
      await refresh()
      await loadList()
    } catch {
      // status already contains backend error
    }
  }

  useEffect(() => {
    loadList().catch(() => setStatus('Failed to load hackathons'))
    loadProjectOptions().catch(() => setStatus('Failed to load projects'))
  }, [])

  const filtered = useMemo(() => {
    const text = query.toLowerCase().trim()
    return text ? hackathons.filter((h) => [h.title, h.organizer, h.status, h.visibility].join(' ').toLowerCase().includes(text)) : hackathons
  }, [hackathons, query])

  const save = async () => {
    try {
      const payload = cleanHackathonPayload(form)
      if (!payload.title) {
        setStatus('Hackathon title is required')
        return
      }
      const data = await runAdminRequest(selectedId ? 'Saving hackathon' : 'Creating hackathon', () => selectedId ? updateAdminHackathon(selectedId, payload) : createAdminHackathon(payload), { setStatus, setLoading: setLoadingAction, payload })
      await loadList()
      await openHackathon(data.hackathon._id)
      setStatus(selectedId ? 'Hackathon updated' : 'Hackathon created')
    } catch {
      // status already contains backend error
    }
  }

  const promptStage = (stage = {}) => {
    const stageName = window.prompt('Stage name', stage.stageName || '')
    if (!stageName) return
    const maximumMarks = Number(window.prompt('Maximum marks', stage.maximumMarks || 100)) || 0
    const order = Number(window.prompt('Order', stage.order || 1)) || 0
    const payload = { stageName, maximumMarks, order, status: stage.status || 'draft', description: stage.description || '' }
    run(stage._id ? 'Updating stage' : 'Creating stage', () => stage._id ? updateAdminHackathonStage(selectedId, stage._id, payload) : createAdminHackathonStage(selectedId, payload))
  }

  const promptCriteria = (stageId, criteria = {}) => {
    const criteriaName = window.prompt('Criteria name', criteria.criteriaName || '')
    if (!criteriaName) return
    const maximumMarks = Number(window.prompt('Maximum marks', criteria.maximumMarks || 10)) || 0
    const weightage = Number(window.prompt('Weightage', criteria.weightage || 0)) || 0
    const payload = { criteriaName, maximumMarks, weightage, description: criteria.description || '' }
    run(criteria._id ? 'Updating criteria' : 'Creating criteria', () => criteria._id ? updateAdminStageCriteria(selectedId, stageId, criteria._id, payload) : createAdminStageCriteria(selectedId, stageId, payload))
  }

  useEffect(() => {
    const team = report?.teams?.find((item) => item.registrationId === judgeRegistrationId)
    const stage = team?.stageWiseMarks?.find((item) => item.stageId === judgeStageId)
    const review = stage?.reviews?.[0]
    setExistingReviewId(review?._id || '')
    if (review?.criteriaScores?.length) setScores(Object.fromEntries(review.criteriaScores.map((score) => [score.criteria?._id || score.criteria, score.obtainedMarks])))
  }, [judgeStageId, judgeRegistrationId, report])

  const selectedCriteria = criteriaByStage[judgeStageId] || []
  const filteredProjectOptions = projectOptions.filter((project) => [project.title, project.category, project.owner?.name, project.owner?.email].filter(Boolean).join(' ').toLowerCase().includes(projectQuery.toLowerCase())).slice(0, 50)
  const scoreTotal = selectedCriteria.reduce((sum, c) => sum + (Number(scores[c._id]) || 0), 0)
  const maxTotal = selectedCriteria.reduce((sum, c) => sum + (Number(c.maximumMarks) || 0), 0)

  if (user?.role !== 'admin') return <Card><h1 className="text-xl font-bold">Admin access required</h1></Card>

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Hackathon Management</h1><p className="text-text-secondary">Complete admin control panel.</p></div>
      {status && <p className="text-sm text-text-secondary">{status}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        <Card hover={false}>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hackathons..." />
          <Button className="w-full mt-3" variant="secondary" onClick={() => { setSelectedId(''); setDetails(null); setForm(emptyForm) }}>New Hackathon</Button>
          <div className="mt-4 space-y-3 max-h-[70vh] overflow-auto">
            {filtered.map((h) => <button key={h._id} type="button" onClick={() => openHackathon(h._id)} className={`w-full text-left p-4 rounded-xl border ${selectedId === h._id ? 'border-primary bg-primary/5' : 'border-border-default bg-bg-secondary'}`}><div className="font-semibold truncate">{h.title}</div><div className="text-xs text-text-muted truncate">{h.organizer || 'No organizer'}</div><div className="mt-2 flex gap-2"><Badge>{h.status}</Badge><Badge variant="secondary">{h.visibility}</Badge></div></button>)}
            {!filtered.length && <p className="text-sm text-text-muted">No hackathons created yet.</p>}
          </div>
        </Card>

        <div className="space-y-5">
          <Card hover={false}>
            <h2 className="text-xl font-bold mb-3">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
              <Input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} placeholder="Organizer" />
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              <select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['draft', 'published', 'active', 'completed', 'archived'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
                {['private', 'college', 'public'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <textarea className="mt-3 w-full min-h-[90px] rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
            <div className="mt-3 flex flex-wrap gap-2"><Button disabled={loadingAction} onClick={save}>{selectedId ? 'Save Hackathon' : 'Create Hackathon'}</Button>{selectedId && <Button variant="secondary" disabled={loadingAction} onClick={() => run('Approving hackathon', () => approveAdminHackathon(selectedId))}>Approve</Button>}{selectedId && <Button variant="danger" disabled={loadingAction} onClick={() => window.prompt('Type DELETE_HACKATHON to archive') === 'DELETE_HACKATHON' && run('Archiving hackathon', () => archiveAdminHackathon(selectedId))}>Delete</Button>}</div>
          </Card>

          {details && <>
            <Card hover={false}><h2 className="text-xl font-bold mb-3">Registrations</h2><div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 mb-4"><Input value={projectQuery} onChange={(e) => setProjectQuery(e.target.value)} placeholder="Search projects..." /><select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={registrationProjectId} onChange={(e) => setRegistrationProjectId(e.target.value)}><option value="">Select project</option>{filteredProjectOptions.map((project) => <option key={project._id} value={project._id}>{project.title} · {project.owner?.name || project.owner?.email || 'No owner'}</option>)}</select><Button disabled={!registrationProjectId || loadingAction} onClick={() => run('Adding registration', async () => { await createAdminHackathonRegistration(selectedId, registrationProjectId); setRegistrationProjectId('') })}>Add Project</Button></div>{registrations.map((r) => <div key={r._id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm border-b border-border-default"><span>{r.project?.title || 'Project'} · {r.project?.category || 'No category'} · Owner: {r.project?.owner?.name || 'Unknown'} · Team: {(r.project?.teamMembers || r.registeredUsers || []).map((u) => u.name).join(', ') || 'No users listed'} · {r.registrationStatus}</span><div className="flex gap-2"><Button size="xs" variant="secondary" onClick={() => alert(JSON.stringify(r.project, null, 2))}>Project</Button><Button size="xs" disabled={loadingAction} onClick={() => run('Approving registration', () => updateAdminHackathonRegistrationStatus(selectedId, r._id, 'approved'))}>Approve</Button><Button size="xs" disabled={loadingAction} variant="danger" onClick={() => run('Rejecting registration', () => updateAdminHackathonRegistrationStatus(selectedId, r._id, 'rejected'))}>Reject</Button></div></div>)}{!registrations.length && <p className="text-sm text-text-muted">No registrations found.</p>}</Card>

            <Card hover={false}><div className="flex justify-between mb-3"><h2 className="text-xl font-bold">Stages</h2><Button size="sm" disabled={loadingAction} onClick={() => promptStage()}>Create Stage</Button></div>{stages.map((s) => <div key={s._id} className="flex justify-between gap-2 py-2 border-b border-border-default text-sm"><span>{s.order}. {s.stageName} · {s.maximumMarks} marks · {s.status}</span><div className="flex gap-2"><Button size="xs" variant="secondary" onClick={() => promptStage(s)}>Edit</Button><Button size="xs" disabled={loadingAction} variant="danger" onClick={() => run('Archiving stage', () => updateAdminHackathonStage(selectedId, s._id, { status: 'archived' }))}>Delete</Button></div></div>)}{!stages.length && <p className="text-sm text-text-muted">No stages found.</p>}</Card>

            <Card hover={false}><h2 className="text-xl font-bold mb-3">Criteria</h2>{stages.map((s) => <div key={s._id} className="mb-4"><div className="flex justify-between"><h3 className="font-semibold">{s.stageName}</h3><Button size="xs" disabled={loadingAction} onClick={() => promptCriteria(s._id)}>Add Criteria</Button></div>{(criteriaByStage[s._id] || []).map((c) => <div key={c._id} className="flex justify-between gap-2 py-1 text-sm"><span>{c.criteriaName} · {c.maximumMarks} marks · {c.weightage}%</span><div className="flex gap-2"><Button size="xs" variant="secondary" onClick={() => promptCriteria(s._id, c)}>Edit</Button><Button size="xs" disabled={loadingAction} variant="danger" onClick={() => run('Disabling criteria', () => updateAdminStageCriteria(selectedId, s._id, c._id, { ...c, maximumMarks: 0, weightage: 0 }))}>Delete</Button></div></div>)}{!(criteriaByStage[s._id] || []).length && <p className="text-xs text-text-muted mt-2">No criteria found.</p>}</div>)}{!stages.length && <p className="text-sm text-text-muted">Create a stage before adding criteria.</p>}</Card>

            <Card hover={false}><h2 className="text-xl font-bold mb-3">Submissions</h2>{submissions.map((s) => <div key={s._id} className="flex justify-between gap-2 py-2 text-sm border-b border-border-default"><span>{s.project?.title || 'Project'} · {s.submissionStatus} · {s.demoLink || s.githubLink || 'No link'}</span><div className="flex gap-2"><Button size="xs" variant="secondary" onClick={() => alert(JSON.stringify(s, null, 2))}>Details</Button><Button size="xs" disabled={loadingAction} onClick={() => run('Updating submission', () => updateAdminHackathonSubmissionStatus(selectedId, s._id, window.prompt('Status', s.submissionStatus) || s.submissionStatus))}>Status</Button></div></div>)}{!submissions.length && <p className="text-sm text-text-muted">No submissions found.</p>}</Card>

            <Card hover={false}><h2 className="text-xl font-bold mb-3">Judging</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={judgeStageId} onChange={(e) => { setJudgeStageId(e.target.value); setScores({}) }}><option value="">Select stage</option>{stages.map((s) => <option key={s._id} value={s._id}>{s.stageName}</option>)}</select><select className="rounded-xl border border-border-default bg-bg-secondary p-3 text-sm" value={judgeRegistrationId} onChange={(e) => setJudgeRegistrationId(e.target.value)}><option value="">Select team</option>{registrations.map((r) => <option key={r._id} value={r._id}>{r.project?.title || 'Project'}</option>)}</select></div>{selectedCriteria.map((c) => <div key={c._id} className="grid grid-cols-[1fr_120px] gap-3 mt-3 items-center text-sm"><span>{c.criteriaName} / {c.maximumMarks}</span><Input type="number" value={scores[c._id] || ''} onChange={(e) => setScores({ ...scores, [c._id]: e.target.value })} /></div>)}{!selectedCriteria.length && <p className="text-sm text-text-muted mt-3">No criteria available for scoring.</p>}<p className="text-sm text-text-secondary mt-3">Total: {scoreTotal}/{maxTotal}</p><Button className="mt-2" disabled={!judgeStageId || !judgeRegistrationId || !selectedCriteria.length || loadingAction} onClick={() => run(existingReviewId ? 'Updating evaluation' : 'Saving evaluation', () => createAdminJudgeReview(selectedId, judgeStageId, judgeRegistrationId, { criteriaScores: selectedCriteria.map((c) => ({ criteria: c._id, obtainedMarks: Number(scores[c._id]) || 0 })), feedback: window.prompt('Feedback', '') || '' }))}>{existingReviewId ? 'Update Score' : 'Save Score'}</Button></Card>

            <Card hover={false}><h2 className="text-xl font-bold mb-3">Leaderboard</h2>{leaderboard.length ? <div className="overflow-x-auto"><table className="min-w-full text-sm"><tbody>{leaderboard.map((r) => <tr key={r.registrationId} className="border-b border-border-default"><td className="py-2">#{r.rank}</td><td>{r.project?.title || 'Project'}</td><td>{r.totalObtainedMarks}/{r.totalMaximumMarks}</td><td>{r.percentage}%</td></tr>)}</tbody></table></div> : <p className="text-sm text-text-muted">No leaderboard scores yet.</p>}</Card>

            <Card hover={false}><div className="flex justify-between gap-3"><div><h2 className="text-xl font-bold">Reports</h2><p className="text-sm text-text-secondary">Teams: {report?.teams?.length || 0} · Export rows: {exportRows.length}</p></div><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => window.open(getAdminHackathonCsvUrl(selectedId), '_blank')}>Export CSV</Button><Button size="sm" variant="secondary" onClick={() => window.open(getAdminHackathonPdfUrl(selectedId), '_blank')}>Export PDF</Button></div></div></Card>

            <Card hover={false}><div className="flex justify-between mb-3"><h2 className="text-xl font-bold">Announcements</h2><Button size="sm" disabled={loadingAction} onClick={() => run('Creating announcement', () => createAdminHackathonAnnouncement(selectedId, { title: window.prompt('Title', '') || 'Announcement', message: window.prompt('Message', '') || '', priority: 'normal' }))}>Create</Button></div>{announcements.map((a) => <div key={a._id} className="flex justify-between gap-2 py-2 border-b border-border-default text-sm"><span>{a.title} · {a.priority}</span><div className="flex gap-2"><Button size="xs" variant="secondary" onClick={() => run('Updating announcement', () => updateAdminHackathonAnnouncement(selectedId, a._id, { title: window.prompt('Title', a.title) || a.title, message: window.prompt('Message', a.message) || a.message, priority: a.priority }))}>Edit</Button><Button size="xs" disabled={loadingAction} variant="danger" onClick={() => window.confirm('Delete announcement?') && run('Deleting announcement', () => deleteAdminHackathonAnnouncement(selectedId, a._id))}>Delete</Button></div></div>)}{!announcements.length && <p className="text-sm text-text-muted">No announcements found.</p>}</Card>
          </>}
        </div>
      </div>
    </div>
  )
}
