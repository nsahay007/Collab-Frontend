import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PhaseHero,
  QuestionCard,
  LinkProofRow,
  TextArea,
  FileProofZone,
  SavePhaseBar,
} from '../PipelinePrimitives'
import ReadinessRing from '../../../../components/common/ReadinessRing'
import Badge from '../../../../components/common/Badge'
import { saveIncubationPhase } from '../../sprintSave'
import { loadSprintMeta } from '../../sprintMeta'
import { uploadProjectFile } from '../../../projects/projectAPI'
import { normalizeLifecycleStage, getLifecycleLabel } from '../../../../utils/ventureLifecycle'

const CHECKLIST = [
  { id: 'identity', label: 'Startup identity & pitch', field: 'foundation' },
  { id: 'validation', label: 'Validation proof collected', field: 'validation' },
  { id: 'mvp', label: 'MVP / demo evidence', field: 'execution' },
  { id: 'readiness', label: 'Incubation readiness score', field: 'score' },
]

export default function PhaseIncubation({ phase, project, phases, onSaved, showToast }) {
  const navigate = useNavigate()
  const projectId = project._id || project.id
  const [saving, setSaving] = useState(false)
  const [uploadedKinds, setUploadedKinds] = useState([])
  const [form, setForm] = useState({
    pitchDeckLink: '',
    demoVideoLink: '',
    overviewNotes: '',
  })

  useEffect(() => {
    const meta = loadSprintMeta(projectId)
    setForm({
      pitchDeckLink: meta.pitchDeckLink || '',
      demoVideoLink: meta.demoVideoLink || project.validation?.demoLink || '',
      overviewNotes: meta.overviewNotes || '',
    })
  }, [project, projectId])

  const executionProgress = Number(phases?.find((item) => item.id === 'execution')?.progress || 0)
  const readiness = Math.max(Number(project.readinessScore || 0), Math.round(40 + (executionProgress * 0.4)))
  const stage = normalizeLifecycleStage(project.lifecycleStage)
  const projectFiles = Array.isArray(project.files) ? project.files : []
  const pitchFiles = projectFiles.filter((file) => /pdf|presentation|slide|deck/i.test(`${file.mimetype || ''} ${file.originalName || ''}`))
  const demoFiles = projectFiles.filter((file) => /video/i.test(`${file.mimetype || ''} ${file.originalName || ''}`))
  const hasPitchAsset = Boolean(form.pitchDeckLink || pitchFiles.length || uploadedKinds.includes('pitch'))
  const hasDemoAsset = Boolean(form.demoVideoLink || demoFiles.length || uploadedKinds.includes('demo'))
  const hasOverview = form.overviewNotes.trim().length > 30 || Boolean(project.description || project.shortPitch)

  const checklistStatus = (item) => {
    const p = phases?.find((x) => x.id === item.field)
    if (item.field === 'score') return readiness >= 60
    return (p?.progress || 0) >= 80
  }

  const handleSave = async () => {
    if (!hasPitchAsset) {
      showToast?.('Add a pitch deck link or upload a deck first.', 'error')
      return
    }
    if (!hasDemoAsset) {
      showToast?.('Add a demo video link or upload a demo file first.', 'error')
      return
    }
    if (!hasOverview) {
      showToast?.('Add a short startup overview before completing.', 'error')
      return
    }

    setSaving(true)
    try {
      await saveIncubationPhase(projectId, form)
      showToast?.('Startup marked incubation ready', 'success')
      onSaved?.()
      navigate(`/project/${projectId}/package`, { replace: true })
    } catch (err) {
      showToast?.('Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleFile = async (file, label) => {
    if (!file) return
    try {
      await uploadProjectFile(projectId, file)
      setUploadedKinds((current) => [...new Set([...current, /demo/i.test(label) ? 'demo' : 'pitch'])])
      showToast?.(`${label} uploaded`, 'success')
      onSaved?.()
    } catch {
      showToast?.('Upload failed', 'error')
    }
  }

  return (
    <div className="pipeline-phase pipeline-phase--incubation space-y-5">
      <PhaseHero phase={phase} progress={phase.progress} themeClass="pipeline-theme-incubation" />

      <section className="pipeline-incubation-status grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-card p-6 flex flex-col items-center">
          <ReadinessRing value={readiness} />
          <p className="text-sm font-semibold text-text-primary mt-4">Incubation readiness</p>
          <Badge variant="primary" className="mt-2">{getLifecycleLabel(stage)}</Badge>
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-6">
          <p className="text-sm font-semibold text-text-primary mb-3">Before you apply</p>
          <ul className="space-y-2">
            {CHECKLIST.map((item) => {
              const done = checklistStatus(item)
              return (
                <li key={item.id} className="flex items-center gap-2 text-sm">
                  <span className={done ? 'text-success' : 'text-text-muted'}>{done ? '✓' : '○'}</span>
                  <span className={done ? 'text-text-secondary' : 'text-text-muted'}>{item.label}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <QuestionCard
        number={1}
        title="Pitch deck upload"
        why="Programs review how you tell the story — deck link or PDF proof."
        complete={hasPitchAsset}
      >
        <LinkProofRow
          label="Pitch deck link"
          value={form.pitchDeckLink}
          onChange={(v) => setForm((p) => ({ ...p, pitchDeckLink: v }))}
          placeholder="Google Slides, Canva, or Drive"
        />
        <FileProofZone hint="Or upload PDF deck" accept=".pdf" onFile={(f) => handleFile(f, 'Pitch deck')} />
        <AssetList title="Uploaded pitch files" files={pitchFiles} />
      </QuestionCard>

      <QuestionCard
        number={2}
        title="Demo video upload"
        why="A short demo proves the product exists."
        complete={hasDemoAsset}
      >
        <LinkProofRow
          label="Demo video link"
          value={form.demoVideoLink}
          onChange={(v) => setForm((p) => ({ ...p, demoVideoLink: v }))}
          placeholder="Loom, YouTube, or Drive"
        />
        <FileProofZone hint="Optional video file" accept="video/*" onFile={(f) => handleFile(f, 'Demo video')} />
        <AssetList title="Uploaded demo files" files={demoFiles} />
      </QuestionCard>

      <QuestionCard
        number={3}
        title="Startup overview review"
        why="Auto-compiled from earlier phases — add final polish for incubators."
        complete={hasOverview}
      >
        <div className="mb-4 rounded-xl border border-border bg-bg-secondary/40 p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Generated startup info</p>
          <p className="text-sm font-semibold text-text-primary">{project.title}</p>
          <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap">
            {project.description || project.shortPitch || 'Your startup overview will appear here as earlier phases are completed.'}
          </p>
        </div>
        <TextArea
          id="inc-overview"
          rows={5}
          value={form.overviewNotes}
          onChange={(v) => setForm((p) => ({ ...p, overviewNotes: v }))}
          placeholder="Executive summary for incubation applications…"
        />
      </QuestionCard>

      <section className="rounded-2xl border border-dashed border-secondary/40 bg-secondary/5 p-5">
        <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Generated documents</p>
        <p className="text-sm text-text-secondary">
          Collab will compile phase answers into incubation-ready documents. Your sprint data is structured for:
          identity brief, validation report, build log, and application package.
        </p>
      </section>

      <SavePhaseBar saving={saving} onSave={handleSave} label="Save Incubation Package" />
    </div>
  )
}

function AssetList({ title, files }) {
  if (!files.length) {
    return <p className="mt-3 text-xs text-text-muted">{title}: no uploaded files yet.</p>
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-bg-secondary/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</p>
      <div className="mt-2 space-y-2">
        {files.map((file) => (
          <a
            key={file._id || file.filename || file.originalName}
            href={file.downloadUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg bg-bg-card px-3 py-2 text-sm text-text-primary hover:text-primary"
          >
            {file.originalName || file.filename || 'Uploaded file'}
          </a>
        ))}
      </div>
    </div>
  )
}
