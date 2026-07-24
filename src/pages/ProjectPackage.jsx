import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { projectPackageMockData } from '../document-engine/sample-data/projectPackageMockData'
import { fieldsByDocument, packageDocuments } from '../document-engine/templates/projectPackageTemplates'
import ProjectPackageRenderer from '../document-engine/components/ProjectPackageRenderer'
import { clearDocumentDraft, loadPackageDraft, savePackageDraft } from '../document-engine/utils/packageDraft'
import { buildDocFiles, buildPdfFiles, downloadBlob, makeZip } from '../document-engine/utils/packageExport'
import { fetchProject } from '../features/projects/projectAPI'

const dateText = (value) => value ? new Date(value).toLocaleDateString('en-IN') : ''
const userId = (user) => user?._id || user?.id || user?.userId || ''
const mapProjectPackageData = (project = {}) => {
  const owner = project.owner || {}
  const members = project.teamMembers || []
  const team = [
    owner && (owner.name || owner.email) ? { role: 'Founder', name: owner.name || 'Founder', email: owner.email || '', userId: userId(owner) } : null,
    ...members.map((member) => ({ role: 'Team Member', name: member.name || 'Team member', email: member.email || '', userId: userId(member) }))
  ].filter(Boolean)
  const evidence = project.validation?.workspace?.evidence || []
  const files = [...(project.files || []), ...(project.validation?.sharedFiles || [])]
  return {
    startupName: project.title || '',
    tagline: project.pipeline?.foundation?.tagline || project.shortPitch || '',
    category: project.category || '',
    readinessScore: String(project.readinessScore ?? ''),
    currentStage: project.lifecycleStage || '',
    founderName: owner.name || '',
    founderEmail: owner.email || '',
    descriptorWords: project.pipeline?.foundation?.descriptorWords || [],
    teamMemberCount: String(team.length || ''),
    dateCreated: dateText(project.createdAt),
    problemStatement: project.validation?.workspace?.problemStatement || project.description || '',
    targetUsers: project.validation?.workspace?.targetUsers || '',
    whyThisMatters: project.shortPitch || '',
    founderInspiration: project.pipeline?.purpose?.founderInspiration || '',
    impactStatement: project.pipeline?.purpose?.impactStatement || '',
    team,
    collegeInstitution: project.college?.name || '',
    dateGenerated: dateText(new Date()),
    surveyNotes: project.validation?.workspace?.whoSpokenTo || '',
    feedbackNotes: project.validation?.workspace?.feedbackChanges || project.validation?.demoNotes || '',
    repeatedProblems: project.validation?.workspace?.repeatedProblems || '',
    surprisingInsights: project.validation?.workspace?.surprisingInsights || '',
    validationEvidence: evidence.map((item) => item.title).filter(Boolean),
    mvpRoadmap: project.pipeline?.mvp?.roadmap || '',
    demoLink: (project.pipeline?.mvp?.demoLinks || [project.validation?.demoLink]).filter(Boolean).join(', '),
    githubLink: (project.pipeline?.mvp?.githubLinks || []).join(', '),
    figmaDesignLink: (project.pipeline?.mvp?.figmaLinks || []).join(', '),
    uploadedPrototypeFiles: files.map((file) => file.originalName).filter(Boolean),
    mvpSummary: project.pipeline?.incubation?.startupOverview || project.pipeline?.incubation?.executiveSummary || '',
    currentProductStatus: project.lifecycleStage || '',
    startupInformation: project.pipeline?.incubation?.startupOverview || project.description || '',
    founderInformation: [owner.name, owner.email].filter(Boolean).join(' - '),
    validationStatistics: `${evidence.length} validation evidence item${evidence.length === 1 ? '' : 's'}`,
    uploadedEvidenceCount: String(files.length || evidence.length || 0),
  }
}

export default function ProjectPackage() {
  const { id } = useParams()
  const [activeId, setActiveId] = useState(packageDocuments[0].id)
  const [draft, setDraft] = useState(() => loadPackageDraft(id))
  const [projectData, setProjectData] = useState({})
  const [saved, setSaved] = useState('Saved locally')
  const [busy, setBusy] = useState('')
  const activeDoc = packageDocuments.find((doc) => doc.id === activeId) || packageDocuments[0]
  const data = useMemo(() => ({ ...projectPackageMockData, ...projectData, ...draft }), [projectData, draft])

  useEffect(() => {
    let active = true
    fetchProject(id).then((project) => {
      if (active) setProjectData(mapProjectPackageData(project))
    }).catch(() => {})
    return () => { active = false }
  }, [id])

  const updateField = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setSaved('Unsaved changes')
  }
  const save = () => {
    savePackageDraft(id, draft)
    setSaved('Saved locally')
  }
  const resetCurrent = () => {
    const next = clearDocumentDraft(draft, fieldsByDocument[activeId] || [])
    setDraft(next)
    savePackageDraft(id, next)
    setSaved('Current document reset')
  }
  const resetAll = () => {
    setDraft({})
    savePackageDraft(id, {})
    setSaved('Entire package reset')
  }
  const downloadDocZip = () => {
    downloadBlob(makeZip(buildDocFiles(data)), 'collab_project_package_docs.zip')
  }
  const downloadPdfZip = async () => {
    setBusy('pdf')
    try {
      downloadBlob(makeZip(buildPdfFiles(data)), 'collab_project_package_pdfs.zip')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Project Package</p>
          <h1 className="text-3xl font-bold text-text-primary">Professional startup documents</h1>
          <p className="mt-2 text-sm text-text-secondary">Preview, edit allowed fields, save drafts, and export the complete document package.</p>
        </div>
        <span className="text-sm text-text-muted">{saved}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <Card hover={false} className="h-fit lg:sticky lg:top-24">
          <div className="space-y-2">
            {packageDocuments.map((doc) => (
              <button key={doc.id} type="button" onClick={() => setActiveId(doc.id)} className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${activeId === doc.id ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary/10 hover:text-primary'}`}>
                {doc.title}
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card hover={false} className="flex flex-wrap gap-2">
            <Button size="sm" onClick={save}>Save Changes</Button>
            <Button size="sm" variant="secondary" onClick={resetCurrent}>Reset Current Document</Button>
            <Button size="sm" variant="secondary" onClick={resetAll}>Reset Entire Package</Button>
            <Button size="sm" variant="secondary" onClick={downloadPdfZip} disabled={busy === 'pdf'}>{busy === 'pdf' ? 'Preparing ZIP...' : 'Download Full PDF ZIP'}</Button>
            <Button size="sm" variant="secondary" onClick={downloadDocZip}>Download Full DOC ZIP</Button>
          </Card>
          <div className="pp-shell pp-print-target">
            <ProjectPackageRenderer document={activeDoc} data={data} onChange={updateField} />
          </div>
        </div>
      </div>
    </div>
  )
}
