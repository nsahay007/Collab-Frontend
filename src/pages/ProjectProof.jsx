import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import api from '../services/api'
import {
  getLifecycleLabel,
  getLifecycleProgress,
  getNextLifecycleLabel,
  normalizeLifecycleStage
} from '../utils/ventureLifecycle'

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
      setError('Venture id is missing.')
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
  const lifecycleStage = normalizeLifecycleStage(proof?.lifecycleStage || proof?.currentLifecycleStage)
  const lifecycleProgress = proof?.lifecycleProgress ?? getLifecycleProgress(lifecycleStage)

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
        <p className="text-text-secondary">Loading venture proof...</p>
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
        <p className="text-sm font-medium text-success mb-2">
          Venture Stage: {proof?.lifecycleLabel || getLifecycleLabel(lifecycleStage)}
        </p>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{proof?.title || 'Venture Proof of Work'}</h1>
        <p className="text-text-secondary">{proof?.description || 'No venture description provided.'}</p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
            <span>{lifecycleProgress}% lifecycle readiness</span>
            <span>Next: {getNextLifecycleLabel(lifecycleStage)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-bg-secondary">
            <div
              className="h-2 rounded-full bg-success transition-all"
              style={{ width: `${Math.max(0, Math.min(100, lifecycleProgress))}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleCopyLink}>Copy Venture Link</Button>
          {copied ? <span className="text-sm text-success">Link copied.</span> : null}
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Team Contributors</h2>
        {Array.isArray(proof?.teamMembers) && proof.teamMembers.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {proof.teamMembers.map((member, index) => (
              <li key={`${member}-${index}`} className="rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary">
                {member}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">No team contributors listed.</p>
        )}
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Execution Checkpoints</h2>
        <p className="text-sm text-text-secondary mb-4">
          Checkpoints are proof artifacts only. Venture progression is controlled by lifecycle stage.
        </p>
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
          <li>- Continue the next venture milestone</li>
          <li>- Improve validation evidence and execution readiness</li>
          <li>- Prepare incubation materials when the venture is ready</li>
        </ul>
      </Card>
    </div>
  )
}
