import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PhaseHero,
  QuestionCard,
  TextArea,
  LinkProofRow,
  FileProofZone,
  SavePhaseBar,
} from '../PipelinePrimitives'
import Button from '../../../../components/common/Button'
import {
  MilestoneTracker,
  BlockerPanel,
  ContributorActivityFeed,
} from '../../components/DashboardBlocks'
import { createMilestone, uploadProjectFile } from '../../../projects/projectAPI'
import { updateProjectDetails } from '../../../projects/projectAPI'
import { getBlockers, getNextMilestone } from '../../executionUtils'
import { loadSprintMeta, saveSprintMeta } from '../../sprintMeta'

export default function PhaseMvp({
  phase,
  project,
  milestones,
  logs,
  onSaved,
  onMilestonesRefresh,
  showToast,
}) {
  const projectId = project._id || project.id
  const meta = loadSprintMeta(projectId)
  const [saving, setSaving] = useState(false)
  const [roadmap, setRoadmap] = useState(project.executionPlan || meta.roadmap || '')
  const [mvpLinks, setMvpLinks] = useState({
    figma: meta.mvpFigma || '',
    github: meta.mvpGithub || '',
    demo: project.validation?.demoLink || meta.mvpDemo || '',
  })
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '' })
  const [creating, setCreating] = useState(false)

  const blockers = getBlockers(project, milestones)
  const nextMilestone = getNextMilestone(project, milestones)

  const handleSaveRoadmap = async () => {
    setSaving(true)
    try {
      await updateProjectDetails(projectId, { executionPlan: roadmap })
      saveSprintMeta(projectId, { roadmap, ...mvpLinks })
      showToast?.('Execution plan saved', 'success')
      onSaved?.()
    } catch (err) {
      showToast?.('Could not save roadmap', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateMilestone = async () => {
    if (!newMilestone.title.trim()) return
    setCreating(true)
    try {
      await createMilestone(projectId, {
        title: newMilestone.title.trim(),
        description: newMilestone.description,
        status: 'pending',
      })
      setNewMilestone({ title: '', description: '' })
      showToast?.('Milestone created', 'success')
      onMilestonesRefresh?.()
    } catch (err) {
      showToast?.(err?.response?.data?.message || 'Could not create milestone', 'error')
    } finally {
      setCreating(false)
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
          title="Milestone tracking"
          why="Create and track deliverables — this is active startup building."
          complete={milestones.length > 0}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] mb-4">
            <input
              type="text"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone((p) => ({ ...p, title: e.target.value }))}
              placeholder="New milestone title"
              className="pipeline-input"
            />
            <Button size="sm" onClick={handleCreateMilestone} disabled={creating}>
              Add milestone
            </Button>
          </div>
          <MilestoneTracker milestones={milestones} nextMilestone={nextMilestone} />
          <Link to={`/project/${projectId}`} className="inline-block mt-3 text-sm text-primary hover:underline">
            Manage milestones in full workspace →
          </Link>
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
              onClick={() => {
                saveSprintMeta(projectId, { ...mvpLinks, mvpFigma: mvpLinks.figma, mvpGithub: mvpLinks.github, mvpDemo: mvpLinks.demo })
                showToast?.('MVP links saved locally', 'success')
              }}
            >
              Save MVP links
            </Button>
          </div>
        </QuestionCard>

        <BlockerPanel blockers={blockers} />
        <ContributorActivityFeed logs={logs} />
      </section>
    </div>
  )
}
