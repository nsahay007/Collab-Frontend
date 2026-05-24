import React, { useEffect, useState } from 'react'
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
  { id: 'public', label: 'Public execution on Feed', field: 'public' },
  { id: 'readiness', label: 'Incubation readiness score', field: 'score' },
]

export default function PhaseIncubation({ phase, project, phases, onSaved, showToast }) {
  const projectId = project._id || project.id
  const [saving, setSaving] = useState(false)
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

  const readiness = Number(project.readinessScore || 0)
  const stage = normalizeLifecycleStage(project.lifecycleStage)

  const checklistStatus = (item) => {
    const p = phases?.find((x) => x.id === item.field)
    if (item.field === 'score') return readiness >= 60
    return (p?.progress || 0) >= 80
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveIncubationPhase(projectId, form)
      showToast?.('Incubation assets saved', 'success')
      onSaved?.()
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
      showToast?.(`${label} uploaded`, 'success')
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
        complete={Boolean(form.pitchDeckLink)}
      >
        <LinkProofRow
          label="Pitch deck link"
          value={form.pitchDeckLink}
          onChange={(v) => setForm((p) => ({ ...p, pitchDeckLink: v }))}
          placeholder="Google Slides, Canva, or Drive"
        />
        <FileProofZone hint="Or upload PDF deck" accept=".pdf" onFile={(f) => handleFile(f, 'Pitch deck')} />
      </QuestionCard>

      <QuestionCard
        number={2}
        title="Demo video upload"
        why="A short demo proves the product exists."
        complete={Boolean(form.demoVideoLink)}
      >
        <LinkProofRow
          label="Demo video link"
          value={form.demoVideoLink}
          onChange={(v) => setForm((p) => ({ ...p, demoVideoLink: v }))}
          placeholder="Loom, YouTube, or Drive"
        />
        <FileProofZone hint="Optional video file" accept="video/*" onFile={(f) => handleFile(f, 'Demo video')} />
      </QuestionCard>

      <QuestionCard
        number={3}
        title="Startup overview review"
        why="Auto-compiled from earlier phases — add final polish for incubators."
        complete={form.overviewNotes.trim().length > 30}
      >
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

      <SavePhaseBar saving={saving} onSave={handleSave} label="Save incubation package" />
    </div>
  )
}
