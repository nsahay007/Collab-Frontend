import React, { useEffect, useState } from 'react'
import {
  PhaseHero,
  QuestionCard,
  TextArea,
  SavePhaseBar,
} from '../PipelinePrimitives'
import { savePurposePhase } from '../../sprintSave'
import { loadSprintMeta, getProblemFromProject, getAudienceFromProject } from '../../sprintMeta'

export default function PhasePurpose({ phase, project, onSaved, showToast }) {
  const projectId = project._id || project.id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    inspiration: '',
    problem: '',
    audience: '',
    impact: '',
  })

  useEffect(() => {
    const meta = loadSprintMeta(projectId)
    setForm({
      inspiration: meta.founderInspiration || '',
      problem: getProblemFromProject(project),
      audience: getAudienceFromProject(project),
      impact: meta.impact || '',
    })
  }, [project, projectId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await savePurposePhase(projectId, form)
      showToast?.('Purpose & vision saved', 'success')
      onSaved?.()
    } catch (err) {
      showToast?.(err?.response?.data?.message || 'Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pipeline-phase pipeline-phase--purpose space-y-5">
      <PhaseHero phase={phase} progress={phase.progress} themeClass="pipeline-theme-purpose" />

      <QuestionCard
        number={1}
        title="What inspired you to start this?"
        why="Founders who articulate motivation build with more conviction."
        complete={form.inspiration.trim().length > 20}
      >
        <TextArea
          id="pp-inspiration"
          rows={4}
          value={form.inspiration}
          onChange={(v) => setForm((p) => ({ ...p, inspiration: v }))}
          placeholder="What moment or experience made you want to build this?"
        />
      </QuestionCard>

      <QuestionCard
        number={2}
        title="What problem does this solve?"
        why="Incubators invest in problems worth solving — be specific."
        complete={form.problem.trim().length > 30}
      >
        <p className="text-xs text-text-muted mb-3 space-y-1">
          <span className="block">• What pain point currently exists?</span>
          <span className="block">• Why is this important?</span>
          <span className="block">• Who faces this issue?</span>
        </p>
        <TextArea
          id="pp-problem"
          large
          rows={6}
          value={form.problem}
          onChange={(v) => setForm((p) => ({ ...p, problem: v }))}
          placeholder="Describe the core problem in depth…"
        />
      </QuestionCard>

      <QuestionCard
        number={3}
        title="Who is this mainly for?"
        why="Clear audience focus drives validation and product decisions."
        complete={form.audience.trim().length > 15}
      >
        <TextArea
          id="pp-audience"
          rows={4}
          value={form.audience}
          onChange={(v) => setForm((p) => ({ ...p, audience: v }))}
          placeholder="Demographics, context, and behaviors of your target users"
        />
      </QuestionCard>

      <QuestionCard
        number={4}
        title="What impact would success create?"
        why="Vision connects daily execution to meaningful outcomes."
        complete={form.impact.trim().length > 20}
      >
        <TextArea
          id="pp-impact"
          rows={4}
          value={form.impact}
          onChange={(v) => setForm((p) => ({ ...p, impact: v }))}
          placeholder="If this works, what changes for users or society?"
        />
      </QuestionCard>

      <SavePhaseBar saving={saving} onSave={handleSave} label="Save purpose & vision" />
    </div>
  )
}
