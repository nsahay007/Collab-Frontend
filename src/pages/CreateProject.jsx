import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { addTeamMember, createMilestone, createProject } from '../features/projects/projectAPI'
import { lookupUserById } from '../features/user/userAPI'

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

const emptyMember = () => ({ userId: '', name: '', role: '', resolved: null, error: '' })
const emptyMilestone = () => ({ title: '', description: '' })
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
    milestones: [emptyMilestone()],
    executionTimeline: ''
  })

  const activeMembers = useMemo(() => (
    form.teamMembers
      .map((member) => ({
        userId: member.userId.trim(),
        name: member.name.trim(),
        role: member.role.trim()
      }))
      .filter((member) => member.userId || member.name || member.role)
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

  const resolveMember = async (index) => {
    const userId = form.teamMembers[index]?.userId?.trim()
    if (!userId) return
    try {
      const response = await lookupUserById(userId)
      const found = response?.user
      if (!found) {
        setForm((prev) => ({
          ...prev,
          teamMembers: prev.teamMembers.map((member, memberIndex) => (
            memberIndex === index ? { ...member, resolved: null, error: 'User ID not found. Please check and try again.' } : member
          ))
        }))
        return
      }
      setForm((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.map((member, memberIndex) => (
          memberIndex === index
            ? { ...member, name: found?.name || member.name, role: member.role || found?.primaryCategory || 'Team Member', resolved: found, error: '' }
            : member
        ))
      }))
    } catch (error) {
      setForm((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.map((member, memberIndex) => (
          memberIndex === index ? { ...member, resolved: null, error: 'User ID not found. Please check and try again.' } : member
        ))
      }))
    }
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

  const updateMilestone = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, milestoneIndex) => (
        milestoneIndex === index ? { ...milestone, [field]: value } : milestone
      ))
    }))
    setError('')
  }

  const addMilestone = () => {
    setForm((prev) => ({ ...prev, milestones: [...prev.milestones, emptyMilestone()] }))
  }

  const removeMilestone = (index) => {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.length === 1
        ? [emptyMilestone()]
        : prev.milestones.filter((_, milestoneIndex) => milestoneIndex !== index)
    }))
  }

  const plannedMilestones = useMemo(() => (
    form.milestones
      .map((milestone) => ({
        title: milestone.title.trim(),
        description: milestone.description.trim()
      }))
      .filter((milestone) => milestone.title)
  ), [form.milestones])

  const validateCurrentStep = () => {
    if (step === 0) {
      if (!form.startupName.trim() || !form.problemStatement.trim() || !form.targetUsers.trim() || !form.category || !form.whyMatters.trim()) {
        return 'Add the startup name, problem, users, category, and why this matters.'
      }
    }
    if (step === 1) {
      const hasInvalidMember = form.teamMembers.some(
        (member) => member.userId.trim() && member.error
      )
      if (hasInvalidMember) return 'One or more User IDs are invalid. Please fix them before continuing.'
    }
    if (step === 2) {
      if (!form.startupGoals.trim()) return 'Please add your startup goals'
      if (!form.featurePlan.trim()) return 'Please add your feature plan'
      if (plannedMilestones.length === 0) return 'Please add at least one execution milestone'
      if (!form.executionTimeline.trim()) return 'Please describe your execution timeline'
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
    ...plannedMilestones.map((item, index) => `- Milestone ${index + 1}: ${item.title}${item.description ? ` - ${item.description}` : ''}`),
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
        numberOfTeammates: Math.min(10, Math.max(1, activeMembers.length + 1)),
        visibility: 'global',
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
      const linkedUserIds = [...new Set(activeMembers.map((member) => member.userId).filter(Boolean))]
      await Promise.allSettled(linkedUserIds.map((userId) => addTeamMember(projectId, userId)))
      await Promise.all(plannedMilestones.map((milestone) => (
        createMilestone(projectId, {
          title: milestone.title,
          description: milestone.description,
          lifecycleStage: 'mvp',
          status: 'pending'
        })
      )))
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
            resolveMember={resolveMember}
            addMember={addMember}
            removeMember={removeMember}
          />
        )}

        {step === 2 && (
          <PlanningStep
            form={form}
            updateField={updateField}
            updateMilestone={updateMilestone}
            addMilestone={addMilestone}
            removeMilestone={removeMilestone}
          />
        )}

        {step === 3 && (
          <ReviewStep form={form} activeMembers={activeMembers} plannedMilestones={plannedMilestones} />
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

function TeamStep({ members, updateMember, resolveMember, addMember, removeMember }) {
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
          <div key={index} className="grid gap-3 rounded-xl border border-border bg-bg-secondary/40 p-3 md:grid-cols-[1.1fr_1fr_1fr_auto]">
            <Input
              value={member.userId}
              onChange={(event) => updateMember(index, 'userId', event.target.value)}
              onBlur={() => resolveMember(index)}
              placeholder="Unique User ID"
            />
            <Input value={member.name} onChange={(event) => updateMember(index, 'name', event.target.value)} placeholder="Member name" />
            <Input value={member.role} onChange={(event) => updateMember(index, 'role', event.target.value)} placeholder="Role, e.g. Product Lead" />
            <Button type="button" variant="secondary" size="sm" onClick={() => removeMember(index)}>Remove</Button>
            {(member.resolved || member.error) && (
              <p className={`md:col-span-4 text-xs ${member.error ? 'text-error' : 'text-success'}`}>
                {member.error || `Linked to ${member.resolved?.name} (${member.resolved?.email})`}
              </p>
            )}
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={addMember}>Add Team Member</Button>
    </div>
  )
}

function PlanningStep({ form, updateField, updateMilestone, addMilestone, removeMilestone }) {
  return (
    <div className="space-y-5">
      <SectionIntro
        title="Step 3: Planning phase"
        text="Keep it simple: goals, features, execution milestones, and timeline. These milestones become your MVP checklist later."
      />
      <Field label="Startup goals *">
        <Textarea value={form.startupGoals} onChange={(value) => updateField('startupGoals', value)} placeholder={'Validate student demand\nBuild clickable prototype\nPrepare MVP demo'} />
      </Field>
      <Field label="Feature plan *">
        <Textarea value={form.featurePlan} onChange={(value) => updateField('featurePlan', value)} placeholder={'Core feature 1\nCore feature 2\nFeature intentionally postponed'} />
      </Field>
      <div>
        <span className="mb-2 block text-sm font-medium text-text-primary">Execution milestones *</span>
        <div className="space-y-3">
          {form.milestones.map((milestone, index) => (
            <div key={index} className="rounded-2xl border border-border bg-bg-secondary/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-primary">Milestone {index + 1}</p>
                <Button type="button" variant="ghost" size="xs" onClick={() => removeMilestone(index)}>
                  Remove
                </Button>
              </div>
              <div className="grid gap-3">
                <Input
                  value={milestone.title}
                  onChange={(event) => updateMilestone(index, 'title', event.target.value)}
                  placeholder={index === 0 ? 'Build Landing Page' : 'Milestone title'}
                />
                <Input
                  value={milestone.description}
                  onChange={(event) => updateMilestone(index, 'description', event.target.value)}
                  placeholder="Optional short description"
                />
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addMilestone} className="mt-3">
          Add Milestone
        </Button>
      </div>
      <Field label="Execution timeline *">
        <Textarea value={form.executionTimeline} onChange={(value) => updateField('executionTimeline', value)} placeholder="Describe the next 2-4 weeks in plain language." />
      </Field>
    </div>
  )
}

function ReviewStep({ form, activeMembers, plannedMilestones }) {
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
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Milestones</p>
            <div className="mt-2 space-y-2">
              {plannedMilestones.map((milestone, index) => (
                <div key={`${milestone.title}-${index}`} className="rounded-xl border border-border bg-bg-card px-3 py-2">
                  <p className="text-sm font-semibold text-text-primary">Milestone {index + 1}: {milestone.title}</p>
                  {milestone.description && <p className="text-xs text-text-secondary mt-1">{milestone.description}</p>}
                </div>
              ))}
            </div>
          </div>
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
