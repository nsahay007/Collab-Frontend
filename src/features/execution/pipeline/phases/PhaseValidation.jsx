import React, { useEffect, useState } from 'react'
import {
  PhaseHero,
  ProofBlock,
  LinkProofRow,
  TextArea,
  FileProofZone,
  SavePhaseBar,
} from '../PipelinePrimitives'
import { saveValidationPhase, uploadValidationFile } from '../../sprintSave'
import { loadSprintMeta } from '../../sprintMeta'

const emptyBlock = () => ({ link: '', notes: '' })

export default function PhaseValidation({ phase, project, onSaved, showToast }) {
  const projectId = project._id || project.id
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [form, setForm] = useState({
    surveys: emptyBlock(),
    interviews: emptyBlock(),
    feedback: emptyBlock(),
  })

  useEffect(() => {
    const meta = loadSprintMeta(projectId)
    const blocks = meta.validationBlocks || {}
    const v = project.validation?.workspace || {}
    setForm({
      surveys: blocks.surveys || { link: '', notes: v.surprisingInsights || '' },
      interviews: blocks.interviews || { link: '', notes: v.whoSpokenTo || '' },
      feedback: blocks.feedback || { link: '', notes: v.repeatedProblems || '' },
    })
  }, [project, projectId])

  const setBlock = (key, patch) => {
    setForm((p) => ({ ...p, [key]: { ...p[key], ...patch } }))
  }

  const handleFile = async (key, file) => {
    if (!file) return
    setUploading(key)
    try {
      await uploadValidationFile(projectId, file, key)
      setBlock(key, { notes: `${form[key].notes}\n[Uploaded: ${file.name}]`.trim() })
      showToast?.('Proof file uploaded', 'success')
    } catch {
      showToast?.('Upload failed', 'error')
    } finally {
      setUploading('')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveValidationPhase(projectId, form)
      showToast?.('Validation evidence saved', 'success')
      onSaved?.()
    } catch (err) {
      showToast?.(err?.response?.data?.message || 'Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const blockDone = (b) => Boolean(b.link?.trim() || b.notes?.trim().length > 20)

  return (
    <div className="pipeline-phase pipeline-phase--validation space-y-5">
      <PhaseHero phase={phase} progress={phase.progress} themeClass="pipeline-theme-validation" />
      <p className="text-sm text-text-secondary border border-secondary/25 rounded-xl px-4 py-3 bg-secondary/5">
        This phase is <strong className="text-text-primary">evidence-driven</strong>. Upload proof that real users experience the problem you are solving.
      </p>

      <ProofBlock
        title="Surveys conducted"
        why="Surveys show patterns at scale — programs want to see structured demand signals."
        proofNeeded="Google Form link, screenshot exports, PDF summary, or CSV responses."
        complete={blockDone(form.surveys)}
      >
        <LinkProofRow
          label="Survey link"
          value={form.surveys.link}
          onChange={(v) => setBlock('surveys', { link: v })}
          placeholder="https://forms.google.com/…"
        />
        <TextArea
          id="val-survey-notes"
          rows={3}
          value={form.surveys.notes}
          onChange={(v) => setBlock('surveys', { notes: v })}
          placeholder="Key findings: response count, repeated pain points…"
        />
        <FileProofZone
          hint={uploading === 'surveys' ? 'Uploading…' : 'Screenshots, PDF, or CSV'}
          accept="image/*,.pdf,.csv"
          onFile={(f) => handleFile('surveys', f)}
        />
      </ProofBlock>

      <ProofBlock
        title="User interviews"
        why="Interviews reveal depth that surveys cannot — qualitative proof matters."
        proofNeeded="Interview notes, recording links, or written summaries."
        complete={blockDone(form.interviews)}
      >
        <LinkProofRow
          label="Recording or doc link"
          value={form.interviews.link}
          onChange={(v) => setBlock('interviews', { link: v })}
          placeholder="Notion, Drive, or Loom link"
        />
        <TextArea
          id="val-interview-notes"
          rows={4}
          value={form.interviews.notes}
          onChange={(v) => setBlock('interviews', { notes: v })}
          placeholder="Who did you speak to? What did they repeat?"
        />
        <FileProofZone hint="Upload interview notes" accept=".pdf,.doc,.docx,image/*" onFile={(f) => handleFile('interviews', f)} />
      </ProofBlock>

      <ProofBlock
        title="Feedback & insights"
        why="Synthesized insights prove you listened and learned from the market."
        proofNeeded="Screenshots, insight summaries, or uploaded feedback artifacts."
        complete={blockDone(form.feedback)}
      >
        <LinkProofRow
          label="Feedback form or doc"
          value={form.feedback.link}
          onChange={(v) => setBlock('feedback', { link: v })}
          placeholder="Link to feedback collection"
        />
        <TextArea
          id="val-feedback-notes"
          rows={4}
          value={form.feedback.notes}
          onChange={(v) => setBlock('feedback', { notes: v })}
          placeholder="What surprised you? What would users pay for?"
        />
        <FileProofZone hint="Upload screenshots or reports" accept="image/*,.pdf" onFile={(f) => handleFile('feedback', f)} />
      </ProofBlock>

      <SavePhaseBar saving={saving} onSave={handleSave} label="Submit validation proof" />
    </div>
  )
}
