import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { fetchProject } from '../features/projects/projectAPI'

export default function FinalStartupPackage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          Document compilation will be connected next. For now, these actions reserve the final launch flow.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="secondary" disabled>
            Download Complete Startup Package (.zip)
          </Button>
          <Button type="button" variant="secondary" disabled>
            Download Certificate of Completion
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
