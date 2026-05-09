import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import api from '../services/api'

const PHASES = ['problem', 'plan', 'build', 'mvp', 'validation', 'demo']

const formatPhase = (value) => {
  if (!value) return 'Unknown'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function ProjectProof() {
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [proof, setProof] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadProof = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get(`/projects/${id}/proof`)
        if (mounted) {
          setProof(response?.data || null)
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load proof of work right now.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (id) {
      loadProof()
    } else {
      setLoading(false)
      setError('Project id is missing.')
    }

    return () => {
      mounted = false
    }
  }, [id])

  const checkpointsByPhase = useMemo(() => {
    const map = new Map()
    ;(proof?.checkpoints || []).forEach((checkpoint) => {
      if (checkpoint?.phase) {
        map.set(checkpoint.phase, checkpoint)
      }
    })
    return map
  }, [proof?.checkpoints])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (_) {
      setCopied(false)
    }
  }

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto" hover={false}>
        <p className="text-text-secondary">Loading project proof...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto border-error/30" hover={false}>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">Proof unavailable</h1>
        <p className="text-text-secondary">{error}</p>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card hover={false} className="border-success/30 bg-success/10">
        <p className="text-sm font-medium text-success mb-2">🎉 Sprint Completed</p>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{proof?.title || 'Project Proof of Work'}</h1>
        <p className="text-text-secondary">{proof?.description || 'No project description provided.'}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleCopyLink}>Copy Project Link</Button>
          {copied ? <span className="text-sm text-success">Link copied.</span> : null}
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Team Members</h2>
        {Array.isArray(proof?.teamMembers) && proof.teamMembers.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {proof.teamMembers.map((member, index) => (
              <li key={`${member}-${index}`} className="rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary">
                {member}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">No team members listed.</p>
        )}
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Phase Timeline</h2>
        <div className="space-y-3">
          {PHASES.map((phase) => {
            const checkpoint = checkpointsByPhase.get(phase)
            return (
              <div key={phase} className="rounded-xl border border-border bg-bg-card px-4 py-3">
                <p className="text-sm font-semibold text-text-primary mb-2">{formatPhase(phase)}</p>

                {checkpoint ? (
                  <div className="space-y-2 text-sm text-text-secondary">
                    <a
                      href={checkpoint.submissionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {checkpoint.submissionLink}
                    </a>
                    <p>{checkpoint.description || 'No additional notes provided.'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">In Progress</p>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">What's Next?</h2>
        <ul className="space-y-2 text-text-secondary">
          <li>- Add this project to your portfolio</li>
          <li>- Improve your MVP</li>
          <li>- Apply to incubators</li>
        </ul>
      </Card>
    </div>
  )
}
