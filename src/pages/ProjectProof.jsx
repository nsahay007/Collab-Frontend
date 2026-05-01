import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import api from '../services/api'

const PHASES = ['problem', 'plan', 'build', 'mvp', 'validation', 'demo']

const formatPhaseName = (phase) => {
  if (!phase) return ''
  return phase.charAt(0).toUpperCase() + phase.slice(1)
}

export default function ProjectProof() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [proof, setProof] = useState(null)
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    const loadProof = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get(`/projects/${id}/proof`)
        setProof(response?.data || null)
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load proof of work.')
      } finally {
        setLoading(false)
      }
    }

    if (id) loadProof()
  }, [id])

  const checkpointsByPhase = useMemo(() => {
    const map = new Map()
    ;(proof?.checkpoints || []).forEach((checkpoint) => {
      if (checkpoint?.phase) map.set(checkpoint.phase, checkpoint)
    })
    return map
  }, [proof?.checkpoints])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyMessage('Project link copied.')
      setTimeout(() => setCopyMessage(''), 2000)
    } catch {
      setCopyMessage('Could not copy link. Please copy from address bar.')
    }
  }

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto" hover={false}>
        <p className="text-text-secondary">Loading proof of work...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto border-error/30" hover={false}>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Proof page unavailable</h1>
        <p className="text-text-secondary">{error}</p>
      </Card>
    )
  }

  const completed = proof?.finalPhaseStatus === 'completed'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card hover={false}>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{proof?.title}</h1>
        <p className="text-text-secondary">{proof?.description || 'No description provided.'}</p>
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Team Members</h2>
        {Array.isArray(proof?.teamMembers) && proof.teamMembers.length > 0 ? (
          <ul className="space-y-2">
            {proof.teamMembers.map((member, index) => (
              <li key={`${member}-${index}`} className="rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary">
                {member}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">No team members found.</p>
        )}
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-semibold text-text-primary mb-3">Phase Timeline</h2>
        <div className="space-y-3">
          {PHASES.map((phase) => {
            const checkpoint = checkpointsByPhase.get(phase)
            return (
              <div key={phase} className="rounded-xl border border-border bg-bg-card px-4 py-4">
                <p className="font-semibold text-text-primary mb-2">{formatPhaseName(phase)}</p>

                {checkpoint ? (
                  <div className="space-y-1 text-sm">
                    <a
                      href={checkpoint.submissionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary font-medium hover:underline break-all"
                    >
                      {checkpoint.submissionLink}
                    </a>
                    <p className="text-text-secondary">{checkpoint.description || 'No description provided.'}</p>
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
        <p className={`text-lg font-semibold ${completed ? 'text-emerald-500' : 'text-amber-500'}`}>
          {completed ? '✅ Completed 14-Day Sprint' : 'In Progress'}
        </p>

        <div className="mt-4 flex flex-col items-start gap-2">
          <Button onClick={handleCopyLink} className="w-full sm:w-auto">
            Copy Project Link
          </Button>
          {copyMessage ? <p className="text-sm text-text-secondary">{copyMessage}</p> : null}
        </div>
      </Card>
    </div>
  )
}
