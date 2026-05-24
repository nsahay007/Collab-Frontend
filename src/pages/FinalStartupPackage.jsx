import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { downloadCertificates, downloadStartupPackage, fetchProject } from '../features/projects/projectAPI'

const saveBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function FinalStartupPackage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadState, setDownloadState] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchProject(id)
      .then((data) => {
        if (active) setProject(data)
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Unable to load startup package.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  const handleDownload = async (type) => {
    setError('')
    setDownloadState(type)
    try {
      const safeTitle = (project?.title || 'startup').replace(/[^a-z0-9-_]+/gi, '_')
      if (type === 'package') {
        const blob = await downloadStartupPackage(id)
        saveBlob(blob, `${safeTitle}_startup_package.zip`)
      } else {
        const blob = await downloadCertificates(id)
        saveBlob(blob, `${safeTitle}_certificates.zip`)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Download failed. Please try again.')
    } finally {
      setDownloadState('')
    }
  }

  if (loading) {
    return <Card hover={false}>Loading final startup package...</Card>
  }

  if (error) {
    return (
      <Card hover={false} className="border-error/30">
        <p className="text-error">{error}</p>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card hover={false} className="overflow-hidden border-success/30 bg-success/5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="success">Incubation Ready</Badge>
            <h1 className="mt-4 text-3xl font-bold text-text-primary">Startup Successfully Prepared</h1>
            <p className="mt-2 text-text-secondary">
              {project?.title || 'Your startup'} has completed the guided pre-incubation pipeline.
              This is now your final startup dashboard.
            </p>
          </div>
          <div className="rounded-3xl border border-success/25 bg-bg-card px-6 py-5 text-center">
            <p className="text-4xl font-bold text-success">100%</p>
            <p className="text-xs uppercase tracking-wide text-text-muted">Prepared</p>
          </div>
        </div>
      </Card>

      <Card hover={false}>
        <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Download Package</p>
        <h2 className="text-xl font-semibold text-text-primary">Final startup documents</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Export your incubation documents separately from team certificates.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="secondary"
            disabled={Boolean(downloadState)}
            onClick={() => handleDownload('package')}
          >
            {downloadState === 'package' ? 'Preparing Package...' : 'Download Startup Package'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={Boolean(downloadState)}
            onClick={() => handleDownload('certificates')}
          >
            {downloadState === 'certificates' ? 'Preparing Certificates...' : 'Download Certificates'}
          </Button>
        </div>
      </Card>

      <div className="flex justify-center">
        <Link to="/build">
          <Button variant="ghost">Back to Build</Button>
        </Link>
      </div>
    </div>
  )
}
