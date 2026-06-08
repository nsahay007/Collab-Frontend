import React, { useEffect, useState } from 'react'
import {
  PhaseHero,
  QuestionCard,
  TextInput,
  SavePhaseBar,
} from '../PipelinePrimitives'
import { CATEGORIES, saveFoundationPhase } from '../../sprintSave'
import { loadSprintMeta, getDescriptorWords } from '../../sprintMeta'

export default function PhaseFoundation({ phase, project, onSaved, showToast }) {
  const projectId = project._id || project.id
  const meta = loadSprintMeta(projectId)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    startupName: '',
    elevatorPitch: '',
    tagline: '',
    descriptorWords: ['', '', ''],
    category: '',
  })

  useEffect(() => {
    const words = getDescriptorWords(project, meta)
    setForm({
      startupName: project.title || '',
      elevatorPitch: project.shortPitch || '',
      tagline: meta.tagline || '',
      descriptorWords: [words[0] || '', words[1] || '', words[2] || ''],
      category: project.category || '',
    })
  }, [project, projectId])

  const setWord = (index, value) => {
    setForm((prev) => {
      const descriptorWords = [...prev.descriptorWords]
      descriptorWords[index] = value
      return { ...prev, descriptorWords }
    })
  }

  const handleSave = async () => {
    if (!form.startupName.trim() || form.startupName.trim().length < 2) {
      showToast?.('Please enter your startup name', 'error')
      return
    }
    if (!form.elevatorPitch.trim() || form.elevatorPitch.trim().length < 10) {
      showToast?.('Please describe your project in one sentence', 'error')
      return
    }
    if (!form.tagline.trim() || form.tagline.trim().length < 3) {
      showToast?.('Please add a tagline for your project', 'error')
      return
    }
    if (!form.descriptorWords.some((w) => w.trim())) {
      showToast?.('Please add at least one descriptor word', 'error')
      return
    }
    if (!form.category) {
      showToast?.('Please select a category', 'error')
      return
    }
    setSaving(true)
    try {
      await saveFoundationPhase(projectId, form)
      showToast?.('Startup identity saved', 'success')
      onSaved?.()
    } catch (err) {
      showToast?.(err?.response?.data?.message || 'Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const complete = (field) => {
    if (field === 'name') return form.startupName.trim().length > 1
    if (field === 'pitch') return form.elevatorPitch.trim().length > 10
    if (field === 'tagline') return form.tagline.trim().length > 3
    if (field === 'words') return form.descriptorWords.some((w) => w.trim())
    if (field === 'cat') return Boolean(form.category)
    return false
  }

  return (
    <div className="pipeline-phase pipeline-phase--foundation space-y-5">
      <PhaseHero phase={phase} progress={phase.progress} themeClass="pipeline-theme-foundation" />

      <QuestionCard
        number={1}
        title="What's your project called?"
        why="Your startup name is the anchor for everything you build on Collab."
        complete={complete('name')}
      >
        <TextInput
          id="pf-name"
          large
          value={form.startupName}
          onChange={(v) => setForm((p) => ({ ...p, startupName: v }))}
          placeholder="e.g. CampusCart"
        />
      </QuestionCard>

      <QuestionCard
        number={2}
        title="Describe your project in one sentence"
        why="This is your elevator pitch — what you do, for whom, in one line."
        example="We help college students find verified part-time gigs in under 24 hours."
        complete={complete('pitch')}
      >
        <TextInput
          id="pf-pitch"
          value={form.elevatorPitch}
          onChange={(v) => setForm((p) => ({ ...p, elevatorPitch: v }))}
          placeholder="One sentence only"
        />
      </QuestionCard>

      <QuestionCard
        number={3}
        title="What's your project tagline?"
        why="A short memorable phrase that captures your edge."
        example="Hire faster. Build smarter."
        complete={complete('tagline')}
      >
        <TextInput
          id="pf-tagline"
          value={form.tagline}
          onChange={(v) => setForm((p) => ({ ...p, tagline: v }))}
          placeholder="3-8 words"
        />
      </QuestionCard>

      <QuestionCard
        number={4}
        title="Pick 3 words describing your project"
        why="These keywords shape discovery and how collaborators understand you."
        example="AI · campus · logistics"
        complete={complete('words')}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              value={form.descriptorWords[i]}
              onChange={(e) => setWord(i, e.target.value)}
              placeholder={'Word ' + (i + 1)}
              className="pipeline-input text-center"
            />
          ))}
        </div>
      </QuestionCard>

      <QuestionCard
        number={5}
        title="Which category best describes your project?"
        why="Helps match you with the right builders and programs."
        complete={complete('cat')}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm((p) => ({ ...p, category: cat }))}
              className={'pipeline-category-card ' + (form.category === cat ? 'pipeline-category-card--active' : '')}
            >
              {cat}
            </button>
          ))}
        </div>
      </QuestionCard>

      <SavePhaseBar saving={saving} onSave={handleSave} label="Save startup identity" />
    </div>
  )
}
