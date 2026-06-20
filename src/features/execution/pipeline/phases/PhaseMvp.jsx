import React, { useMemo, useState } from 'react'
import {
  PhaseHero,
  QuestionCard,
  TextArea,
  LinkProofRow,
  FileProofZone,
  SavePhaseBar,
} from '../PipelinePrimitives'
import Button from '../../../../components/common/Button'
import Badge from '../../../../components/common/Badge'
import { updateMilestone, uploadProjectFile } from '../../../projects/projectAPI'
import { updateProjectDetails } from '../../../projects/projectAPI'
import { loadSprintMeta, saveSprintMeta } from '../../sprintMeta'

export default function PhaseMvp({
  phase,
  project,
  milestones,
  onSaved,
  onMilestonesRefresh,
  onPost,
  showToast,
}) {
  const projectId = project._id || project.id
  const meta = loadSprintMeta(projectId)
  const mvpPipeline = project.pipeline?.mvp || {}
  const [saving, setSaving] = useState(false)
  const [roadmap, setRoadmap] = useState(project.executionPlan || mvpPipeline.roadmap || meta.roadmap || '')
  const [mvpLinks, setMvpLinks] = useState({
    figma: mvpPipeline.figmaLinks?.[0] || meta.mvpFigma || '',
    github: mvpPipeline.githubLinks?.[0] || meta.mvpGithub || '',
    demo: project.validation?.demoLink || mvpPipeline.demoLinks?.[0] || meta.mvpDemo || '',
  })
  const [updatingId, setUpdatingId] = useState('')

  const completedCount = useMemo(
    () => milestones.filter((milestone) => milestone.status === 'completed').length,
    [milestones]
  )
  const checklistProgress = milestones.length ? Math.round((completedCount / milestones.length) * 100) : 0

  const handleSaveRoadmap = async () => {
    setSaving(true)
    try {
      await updateProjectDetails(projectId, {
        executionPlan: roadmap,
        pipeline: {
          mvp: {
            roadmap,
            figmaLinks: mvpLinks.figma ? [mvpLinks.figma] : [],
            githubLinks: mvpLinks.github ? [mvpLinks.github] : [],
            demoLinks: mvpLinks.demo ? [mvpLinks.demo] : [],
          }
        }
      })
      saveSprintMeta(projectId, { roadmap, ...mvpLinks })
      showToast?.('Execution plan saved', 'success')
      onSaved?.()
    } catch (err) {
      showToast?.('Could not save roadmap', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleMilestone = async (milestone) => {
    const milestoneId = milestone._id || milestone.id
    if (!milestoneId || updatingId) return
    setUpdatingId(milestoneId)
    try {
      await updateMilestone(projectId, milestoneId, {
        status: milestone.status === 'completed' ? 'in_progress' : 'completed'
      })
      if (milestone.status !== 'completed') {
        try {
          await onPost?.({
            type: 'milestone',
            content: `Achieved milestone: ${milestone.title}`,
            media: null,
          })
        } catch {
          showToast?.('Milestone completed, but could not publish to Activities', 'error')
        }
      }
      showToast?.('Checklist updated', 'success')
      onMilestonesRefresh?.()
    } catch (err) {
      showToast?.(err?.response?.data?.message || 'Could not update checklist', 'error')
    } finally {
      setUpdatingId('')
    }
  }

  const handleMvpFile = async (file) => {
    if (!file) return
    try {
      await uploadProjectFile(projectId, file)
      showToast?.('MVP asset uploaded', 'success')
      onSaved?.()
    } catch {
      showToast?.('Upload failed', 'error')
    }
  }

  return (
    <div className="pipeline-phase pipeline-phase--mvp space-y-6">
      <PhaseHero phase={phase} progress={phase.progress} themeClass="pipeline-theme-mvp" />

      <QuestionCard
        number="§"
        title="Roadmap planning"
        why="Break execution into milestones your team can ship sprint by sprint."
        complete={roadmap.trim().length > 40}
      >
        <TextArea
          id="mvp-roadmap"
          rows={5}
          value={roadmap}
          onChange={setRoadmap}
          placeholder="Week 1: …&#10;Week 2: …&#10;Key deliverables…"
        />
        <div className="mt-3">
          <Button size="sm" onClick={handleSaveRoadmap} disabled={saving}>
            {saving ? 'Saving…' : 'Save roadmap'}
          </Button>
        </div>
      </QuestionCard>

      <section className="pipeline-mvp-execution-grid space-y-6">
        <QuestionCard
          number="§"
          title="Execution checklist"
          why="This checklist comes only from the milestones created during venture setup. Mark what your team has achieved."
          complete={milestones.length > 0}
        >
          <ExecutionChecklist
            milestones={milestones}
            completedCount={completedCount}
            progress={checklistProgress}
            updatingId={updatingId}
            onToggle={handleToggleMilestone}
          />
        </QuestionCard>

        <QuestionCard
          number="§"
          title="MVP & prototype showcase"
          why="Proof of build: demos, repos, and design files."
          complete={Boolean(mvpLinks.demo || mvpLinks.github || mvpLinks.figma)}
        >
          <LinkProofRow label="Figma / design link" value={mvpLinks.figma} onChange={(v) => setMvpLinks((p) => ({ ...p, figma: v }))} placeholder="https://figma.com/…" />
          <LinkProofRow label="GitHub repository" value={mvpLinks.github} onChange={(v) => setMvpLinks((p) => ({ ...p, github: v }))} placeholder="https://github.com/…" />
          <LinkProofRow label="Live demo link" value={mvpLinks.demo} onChange={(v) => setMvpLinks((p) => ({ ...p, demo: v }))} placeholder="https://…" />
          <FileProofZone
            hint="Screenshots, architecture diagrams, prototype videos"
            accept="image/*,video/*,.pdf"
            onFile={handleMvpFile}
          />
          <div className="mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                saveSprintMeta(projectId, { ...mvpLinks, mvpFigma: mvpLinks.figma, mvpGithub: mvpLinks.github, mvpDemo: mvpLinks.demo })
                try {
                  await updateProjectDetails(projectId, {
                    pipeline: {
                      mvp: {
                        roadmap,
                        figmaLinks: mvpLinks.figma ? [mvpLinks.figma] : [],
                        githubLinks: mvpLinks.github ? [mvpLinks.github] : [],
                        demoLinks: mvpLinks.demo ? [mvpLinks.demo] : [],
                      }
                    }
                  })
                  showToast?.('MVP links saved', 'success')
                  onSaved?.()
                } catch {
                  showToast?.('Could not save MVP links', 'error')
                }
              }}
            >
              Save MVP links
            </Button>
          </div>
        </QuestionCard>

      </section>
    </div>
  )
}

function ExecutionChecklist({ milestones, completedCount, progress, updatingId, onToggle }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-secondary/40 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">MVP execution progress</p>
          <p className="text-xs text-text-muted">{completedCount}/{milestones.length || 0} milestones completed</p>
        </div>
        <Badge variant={progress >= 100 ? 'success' : progress > 0 ? 'primary' : 'default'}>
          {progress}% complete
        </Badge>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-card">
        <div className="h-full rounded-full bg-success transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 space-y-3">
        {milestones.length > 0 ? milestones.map((milestone) => {
          const milestoneId = milestone._id || milestone.id
          const done = milestone.status === 'completed'
          return (
            <button
              key={milestoneId}
              type="button"
              onClick={() => onToggle(milestone)}
              disabled={updatingId === milestoneId}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                done
                  ? 'border-success/30 bg-success/10'
                  : 'border-border bg-bg-card hover:border-primary/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 grid h-6 w-6 place-items-center rounded-full border text-sm ${
                  done ? 'border-success bg-success text-white' : 'border-border text-text-muted'
                }`}>
                  {done ? '✓' : ''}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${done ? 'text-success' : 'text-text-primary'}`}>
                    {milestone.title}
                  </span>
                  {milestone.description && (
                    <span className="mt-1 block text-xs text-text-secondary">{milestone.description}</span>
                  )}
                </span>
              </div>
            </button>
          )
        }) : (
          <p className="rounded-xl border border-dashed border-border bg-bg-card px-4 py-5 text-center text-sm text-text-secondary">
            No setup milestones yet. Add milestones from the venture creation flow.
          </p>
        )}
      </div>
    </div>
  )
}
