import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { createProject } from '../features/projects/projectAPI'

const CATEGORIES = [
  'Tech & Product',
  'Business & Startup',
  'Design & Creative',
  'Marketing & Content',
  'Services & Operations'
]

const STEPS = [
  'Startup Concept',
  'Team',
  'Planning',
  'Review'
]

const emptyMember = () => ({ name: '', role: '' })
const LONG_TEXT_LIMIT = 3000

const splitLines = (value) => String(value || '')
  .split('\n')
  .map((item) => item.trim())
  .filter(Boolean)

const firstText = (...values) => values.find((value) => String(value || '').trim()) || ''

export default function CreateProject() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    startupName: '',
    problemStatement: '',
    targetUsers: '',
    category: '',
    whyMatters: '',
    teamMembers: [emptyMember()],
    startupGoals: '',
    featurePlan: '',
    milestonePlan: '',
    executionTimeline: ''
  })

  const activeMembers = useMemo(() => (
    form.teamMembers
      .map((member) => ({
        name: member.name.trim(),
        role: member.role.trim()
      }))
      .filter((member) => member.name || member.role)
  ), [form.teamMembers])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const updateMember = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, memberIndex) => (
        memberIndex === index ? { ...member, [field]: value } : member
      ))
    }))
    setError('')
  }

  const addMember = () => {
    setForm((prev) => ({ ...prev, teamMembers: [...prev.teamMembers, emptyMember()] }))
  }

  const removeMember = (index) => {
    setForm((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.length === 1
        ? [emptyMember()]
        : prev.teamMembers.filter((_, memberIndex) => memberIndex !== index)
    }))
  }

  const validateCurrentStep = () => {
    if (step === 0) {
      if (!form.startupName.trim() || !form.problemStatement.trim() || !form.targetUsers.trim() || !form.category || !form.whyMatters.trim()) {
        return 'Add the startup name, problem, users, category, and why this matters.'
      }
    }
    if (step === 1 && activeMembers.length === 0) {
      return 'Add at least one team member or role. Collab is built for existing student teams.'
    }
    if (step === 2) {
      if (!form.startupGoals.trim() || !form.featurePlan.trim() || !form.milestonePlan.trim() || !form.executionTimeline.trim()) {
        return 'Add goals, feature plan, milestone plan, and execution timeline.'
      }
    }
    return ''
  }

  const goNext = () => {
    const message = validateCurrentStep()
    if (message) {
      setError(message)
      return
    }
    setStep((prev) => Math.min(STEPS.length - 1, prev + 1))
    setError('')
  }

  const buildDescription = () => [
    `Problem: ${form.problemStatement.trim()}`,
    `Target users: ${form.targetUsers.trim()}`,
    `Why this matters: ${form.whyMatters.trim()}`,
    '',
    'Team:',
    ...(activeMembers.length ? activeMembers.map((member) => `- ${member.name || 'Team member'}: ${member.role || 'Role to clarify'}`) : ['- Team details to be clarified'])
  ].join('\n')

  const buildExecutionPlan = () => [
    'Startup Goals:',
    ...splitLines(form.startupGoals).map((item) => `- ${item}`),
    '',
    'Feature Plan:',
    ...splitLines(form.featurePlan).map((item) => `- ${item}`),
    '',
    'Milestone Plan:',
    ...splitLines(form.milestonePlan).map((item) => `- ${item}`),
    '',
    'Execution Timeline:',
    form.executionTimeline.trim()
  ].join('\n')

  const handleSubmit = async () => {
    const message = validateCurrentStep()
    if (message) {
      setError(message)
      return
    }

    setLoading(true)
    setError('')

    try {
      const roles = [...new Set(activeMembers.map((member) => member.role).filter(Boolean))]
      const payload = {
        title: form.startupName.trim(),
        shortPitch: firstText(form.whyMatters, form.problemStatement).slice(0, 200),
        description: buildDescription(),
        category: form.category,
        tags: splitLines(form.startupGoals).slice(0, 6),
        rolesNeeded: roles,
        skillsRequired: [],
        numberOfTeammates: Math.max(1, activeMembers.length),
        visibility: 'private',
        executionPlan: buildExecutionPlan(),
        techProduct: form.category === 'Tech & Product'
          ? {
            problem: form.problemStatement.trim(),
            targetUsers: form.targetUsers.trim(),
            features: splitLines(form.featurePlan),
            techStack: []
          }
          : undefined,
        businessStartup: form.category === 'Business & Startup'
          ? {
            marketGap: form.problemStatement.trim(),
            targetAudience: form.targetUsers.trim(),
            businessModel: splitLines(form.featurePlan).join(', '),
            revenueIdea: ''
          }
          : undefined
      }

      const response = await createProject(payload)
      const projectId = response?.data?.project?._id || response?.data?._id || response?.project?._id
      if (!projectId) throw new Error('Startup workspace was created, but no id was returned.')
      navigate(`/project/${projectId}`)
    } catch (err) {
      const firstIssue = err?.response?.data?.errors?.[0]
      const detail = firstIssue ? `${firstIssue.path}: ${firstIssue.message}` : ''
      setError(detail || err?.response?.data?.message || err.message || 'Failed to create startup workspace.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Create Startup Workspace</p>
        <h1 className="text-3xl font-bold text-text-primary">Turn your team&apos;s idea into a guided pipeline</h1>
        <p className="text-text-secondary mt-2 max-w-3xl">
          Collab is for student teams that already exist. Add the concept, team, and first execution plan so the workspace can guide you toward incubation readiness.
        </p>
      </div>

      <Card hover={false}>
        <div className="grid gap-2 sm:grid-cols-4">
          {STEPS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                index === step
                  ? 'border-primary bg-primary/10 text-primary'
                  : index < step
                    ? 'border-success/30 bg-success/10 text-success'
                    : 'border-border bg-bg-secondary/40 text-text-muted'
              }`}
            >
              <span className="block text-xs uppercase tracking-wide">Step {index + 1}</span>
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card hover={false}>
        {step === 0 && (
          <ConceptStep form={form} updateField={updateField} />
        )}

        {step === 1 && (
          <TeamStep
            members={form.teamMembers}
            updateMember={updateMember}
            addMember={addMember}
            removeMember={removeMember}
          />
        )}

        {step === 2 && (
          <PlanningStep form={form} updateField={updateField} />
        )}

        {step === 3 && (
          <ReviewStep form={form} activeMembers={activeMembers} />
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="secondary"
            type="button"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0 || loading}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} className="w-full sm:w-auto">
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Creating...' : 'Create Startup Workspace'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function ConceptStep({ form, updateField }) {
  return (
    <div className="space-y-5">
      <SectionIntro
        title="Step 1: Startup concept"
        text="Capture the concept clearly enough that every team member understands what to build next."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Startup name *">
          <Input value={form.startupName} onChange={(event) => updateField('startupName', event.target.value)} placeholder="Example: CampusCart" />
        </Field>
        <Field label="Startup category *">
          <select
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Choose category</option>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Problem statement *">
        <Textarea value={form.problemStatement} onChange={(value) => updateField('problemStatement', value)} placeholder="What exact problem is your team solving?" />
      </Field>
      <Field label="Target users *">
        <Textarea value={form.targetUsers} onChange={(value) => updateField('targetUsers', value)} placeholder="Who has this problem? Be specific." />
      </Field>
      <Field label="Why this matters *">
        <Textarea value={form.whyMatters} onChange={(value) => updateField('whyMatters', value)} placeholder="Why should this startup exist, especially for users in India?" />
      </Field>
    </div>
  )
}

function TeamStep({ members, updateMember, addMember, removeMember }) {
  return (
    <div className="space-y-5">
      <SectionIntro
        title="Step 2: Existing team"
        text="Add your current student team. Finding new members is coming soon, but this launch flow is built for teams that already have people."
      />
      <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">
        Find Team Members is coming soon. For now, create the workspace with your existing team and clarify responsibilities.
      </div>
      <div className="space-y-3">
        {members.map((member, index) => (
          <div key={index} className="grid gap-3 rounded-xl border border-border bg-bg-secondary/40 p-3 md:grid-cols-[1fr_1fr_auto]">
            <Input value={member.name} onChange={(event) => updateMember(index, 'name', event.target.value)} placeholder="Member name" />
            <Input value={member.role} onChange={(event) => updateMember(index, 'role', event.target.value)} placeholder="Role, e.g. Product Lead" />
            <Button type="button" variant="secondary" size="sm" onClick={() => removeMember(index)}>Remove</Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={addMember}>Add Team Member</Button>
    </div>
  )
}

function PlanningStep({ form, updateField }) {
  return (
    <div className="space-y-5">
      <SectionIntro
        title="Step 3: Planning phase"
        text="Keep it simple: goals, features, milestones, and timeline. This becomes your first startup roadmap."
      />
      <Field label="Startup goals *">
        <Textarea value={form.startupGoals} onChange={(value) => updateField('startupGoals', value)} placeholder={'Validate student demand\nBuild clickable prototype\nPrepare MVP demo'} />
      </Field>
      <Field label="Feature plan *">
        <Textarea value={form.featurePlan} onChange={(value) => updateField('featurePlan', value)} placeholder={'Core feature 1\nCore feature 2\nFeature intentionally postponed'} />
      </Field>
      <Field label="Milestone plan *">
        <Textarea value={form.milestonePlan} onChange={(value) => updateField('milestonePlan', value)} placeholder={'Week 1: Finalize problem and interview script\nWeek 2: Build prototype flow\nWeek 3: Test with 10 users'} />
      </Field>
      <Field label="Execution timeline *">
        <Textarea value={form.executionTimeline} onChange={(value) => updateField('executionTimeline', value)} placeholder="Describe the next 2-4 weeks in plain language." />
      </Field>
    </div>
  )
}

function ReviewStep({ form, activeMembers }) {
  return (
    <div className="space-y-5">
      <SectionIntro title="Step 4: Review" text="This structured concept will become your startup workspace." />
      <div className="grid gap-4 lg:grid-cols-2">
        <SummaryCard title="Startup Summary">
          <SummaryRow label="Name" value={form.startupName} />
          <SummaryRow label="Category" value={form.category} />
          <SummaryRow label="Problem" value={form.problemStatement} />
          <SummaryRow label="Users" value={form.targetUsers} />
        </SummaryCard>
        <SummaryCard title="Team">
          {activeMembers.map((member, index) => (
            <SummaryRow key={index} label={member.name || `Member ${index + 1}`} value={member.role || 'Role to clarify'} />
          ))}
        </SummaryCard>
        <SummaryCard title="Planning">
          <SummaryRow label="Goals" value={form.startupGoals} />
          <SummaryRow label="Milestones" value={form.milestonePlan} />
        </SummaryCard>
        <SummaryCard title="Next Timeline">
          <p className="whitespace-pre-wrap text-sm text-text-secondary">{form.executionTimeline}</p>
        </SummaryCard>
      </div>
    </div>
  )
}

function SectionIntro({ title, text }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <p className="text-sm text-text-secondary mt-1">{text}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-primary">{label}</span>
      {children}
    </label>
  )
}

function Textarea({ value, onChange, placeholder, maxLength = LONG_TEXT_LIMIT }) {
  const count = String(value || '').length
  const nearLimit = count > maxLength * 0.9
  return (
    <>
      <textarea
        rows={4}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <span className={`mt-1 block text-right text-xs ${nearLimit ? 'text-warning' : 'text-text-muted'}`}>
        {count}/{maxLength} characters
      </span>
    </>
  )
}

function SummaryCard({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary/40 p-4">
      <h3 className="font-semibold text-text-primary mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{value || 'Not added yet'}</p>
    </div>
  )
}
