import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { projectPackageMockData } from '../document-engine/sample-data/projectPackageMockData'
import { fieldsByDocument, packageDocuments } from '../document-engine/templates/projectPackageTemplates'
import ProjectPackageRenderer from '../document-engine/components/ProjectPackageRenderer'
import { clearDocumentDraft, loadPackageDraft, savePackageDraft } from '../document-engine/utils/packageDraft'
import { buildDocFiles, buildPdfFiles, documentHtml, downloadBlob, makeZip } from '../document-engine/utils/packageExport'

export default function ProjectPackage() {
  const { id } = useParams()
  const [activeId, setActiveId] = useState(packageDocuments[0].id)
  const [draft, setDraft] = useState(() => loadPackageDraft(id))
  const [saved, setSaved] = useState('Saved locally')
  const [busy, setBusy] = useState('')
  const activeDoc = packageDocuments.find((doc) => doc.id === activeId) || packageDocuments[0]
  const data = useMemo(() => ({ ...projectPackageMockData, ...draft }), [draft])

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
  const downloadCurrentDoc = () => {
    downloadBlob(new Blob([documentHtml(activeDoc, data)], { type: 'application/msword' }), `${activeDoc.title.replace(/[^a-z0-9-_]+/gi, '_')}.doc`)
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
          <p className="mt-2 text-sm text-text-secondary">Preview, edit allowed fields, save drafts, and export the active A4 document.</p>
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
            <Button size="sm" variant="secondary" onClick={() => window.print()}>Download Current PDF</Button>
            <Button size="sm" variant="secondary" onClick={downloadCurrentDoc}>Download Current DOC</Button>
            <Button size="sm" variant="secondary" onClick={downloadPdfZip} disabled={busy === 'pdf'}>{busy === 'pdf' ? 'Preparing ZIP...' : 'Download Full PDF ZIP'}</Button>
            <Button size="sm" variant="secondary" onClick={downloadDocZip}>Download Full DOC ZIP</Button>
            <Link to={`/project/${id}`}><Button size="sm" variant="ghost">Back to Workspace</Button></Link>
          </Card>
          <div className="pp-shell pp-print-target">
            <ProjectPackageRenderer document={activeDoc} data={data} onChange={updateField} />
          </div>
        </div>
      </div>
    </div>
  )
}
