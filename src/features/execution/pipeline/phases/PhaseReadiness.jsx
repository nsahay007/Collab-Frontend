import React, { useEffect, useState } from 'react'
import {
  PhaseHero,
  QuestionCard,
  TextArea,
  SavePhaseBar,
} from '../PipelinePrimitives'
import { saveReadinessPhase } from '../../sprintSave'
import { loadSprintMeta } from '../../sprintMeta'
import { normalizeLifecycleStage } from '../../../../utils/ventureLifecycle'

const STAGE_OPTIONS = [
  { id: 'idea', label: 'Idea', hint: 'Concept forming' },
  { id: 'planning', label: 'Planning', hint: 'Scoping & team' },
  { id: 'building', label: 'Building', hint: 'Active development' },
  { id: 'mvp', label: 'Testing', hint: 'MVP & user tests' },
  { id: 'incubation_ready', label: 'Launched', hint: 'Ready to scale' },
]

export default function PhaseReadiness({ phase, project, onSaved, showToast }) {
  const projectId = project._id || project.id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    stage: 'idea',
    roles: [],
    roleInput: '',
    collaboratorNotes: '',
  })

  useEffect(() => {
    const meta = loadSprintMeta(projectId)
    const stage = normalizeLifecycleStage(project.lifecycleStage || project.status)
    const readiness = project.pipeline?.readiness || {}
    setForm({
      stage: STAGE_OPTIONS.some((s) => s.id === stage) ? stage : 'idea',
      roles: project.rolesNeeded || [],
      roleInput: '',
      collaboratorNotes: readiness.notes || meta.collaboratorNotes || '',
    })
  }, [project, projectId])

  const addRole = () => {
    const value = form.roleInput.trim()
    if (!value || form.roles.includes(value)) return
    setForm((p) => ({ ...p, roles: [...p.roles, value], roleInput: '' }))
  }

  const removeRole = (role) => {
    setForm((p) => ({ ...p, roles: p.roles.filter((r) => r !== role) }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveReadinessPhase(projectId, {
        stage: form.stage,
        roles: form.roles,
        collaboratorNotes: form.collaboratorNotes,
      })
      showToast?.('Execution readiness saved', 'success')
      onSaved?.()
    } catch (err) {
      showToast?.(err?.response?.data?.message || 'Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pipeline-phase pipeline-phase--readiness space-y-5">
      <PhaseHero phase={phase} progress={phase.progress} themeClass="pipeline-theme-readiness" />

      <QuestionCard
        number={1}
        title="Current startup stage?"
        why="Sets expectations for what you should focus on this sprint."
        complete={Boolean(form.stage)}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {STAGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setForm((p) => ({ ...p, stage: opt.id }))}
              className={`pipeline-stage-card ${form.stage === opt.id ? 'pipeline-stage-card--active' : ''}`}
            >
              <span className="font-semibold text-text-primary">{opt.label}</span>
              <span className="text-xs text-text-muted mt-1 block">{opt.hint}</span>
            </button>
          ))}
        </div>
      </QuestionCard>

      <QuestionCard
        number={2}
        title="What collaborators / team members might be needed in the future?"
        why="Capture future role gaps without turning this into a hiring flow."
        complete={form.roles.length > 0}
      >
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={form.roleInput}
            onChange={(e) => setForm((p) => ({ ...p, roleInput: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
            placeholder="e.g. Full-stack developer"
            className="pipeline-input flex-1"
          />
          <button type="button" onClick={addRole} className="pipeline-tag-add">
            Add role
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.roles.map((role) => (
            <span key={role} className="pipeline-role-tag">
              {role}
              <button type="button" onClick={() => removeRole(role)} aria-label={`Remove ${role}`}>
                ×
              </button>
            </span>
          ))}
        </div>
        <TextArea
          id="pr-notes"
          rows={3}
          value={form.collaboratorNotes}
          onChange={(v) => setForm((p) => ({ ...p, collaboratorNotes: v }))}
          placeholder="Optional: what might future collaborators help with?"
        />
      </QuestionCard>

      <SavePhaseBar saving={saving} onSave={handleSave} label="Save & enter execution mode" />
    </div>
  )
}
