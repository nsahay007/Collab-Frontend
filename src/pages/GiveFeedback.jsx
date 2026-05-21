import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { getProjectById, submitReview } from '../features/project/projectAPI'
import { uploadsBaseUrl } from '../config/api'

const SCORE_FIELDS = [
  { key: 'problemClarity', label: 'Problem Clarity', hint: 'Is the problem clearly defined?' },
  { key: 'userPainSeverity', label: 'User Pain Severity', hint: 'How serious is the user pain point?' },
  { key: 'solutionFit', label: 'Solution Fit', hint: 'How well does the solution solve the problem?' },
  { key: 'innovation', label: 'Innovation', hint: 'How differentiated is this from alternatives?' },
  { key: 'usefulness', label: 'Usefulness', hint: 'How useful is this for target users right now?' },
  { key: 'executionReadiness', label: 'Execution Readiness', hint: 'Is the team ready to execute?' },
  { key: 'feasibility30Days', label: '30-Day Feasibility', hint: 'Can this realistically be built in 30 days?' },
  { key: 'evidenceStrength', label: 'Evidence Strength', hint: 'Is there proof or data supporting the venture concept?' },
  { key: 'scalabilityPotential', label: 'Scalability Potential', hint: 'Can this grow beyond one small cohort?' },
  { key: 'teamReadiness', label: 'Team Readiness', hint: 'Does the team have required skills and focus?' },
  { key: 'confidence', label: 'Overall Confidence', hint: 'Your confidence in this team succeeding.' }
]

const INITIAL_CRITERIA = SCORE_FIELDS.reduce((acc, field) => {
  acc[field.key] = 4
  return acc
}, {})

export default function GiveFeedback() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [criteria, setCriteria] = useState({
    ...INITIAL_CRITERIA,
    wouldUse: 'yes',
    finalVerdict: 'pass'
  })
  const [feedback, setFeedback] = useState('')
  const [topStrengths, setTopStrengths] = useState('')
  const [topGaps, setTopGaps] = useState('')
  const [biggestRisk, setBiggestRisk] = useState('')
  const [next7DayAction, setNext7DayAction] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getProjectById(id)
        setProject(data)
      } catch (err) {
        console.error(err)
        setError(err?.response?.data?.message || 'Unable to load venture.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProject()
    }
  }, [id])

  const overallScore = useMemo(() => {
    const total = SCORE_FIELDS.reduce((sum, field) => sum + Number(criteria[field.key] || 0), 0)
    return (total / SCORE_FIELDS.length).toFixed(2)
  }, [criteria])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!feedback.trim() || !topStrengths.trim() || !topGaps.trim() || !biggestRisk.trim() || !next7DayAction.trim()) {
      setSubmitError('Please complete all required text fields before submitting.')
      return
    }

    try {
      setSubmitting(true)
      await submitReview(id, {
        criteria: {
          ...Object.fromEntries(
            SCORE_FIELDS.map((field) => [field.key, Number(criteria[field.key])])
          ),
          wouldUse: criteria.wouldUse,
          finalVerdict: criteria.finalVerdict
        },
        feedback: feedback.trim(),
        topStrengths: topStrengths.trim(),
        topGaps: topGaps.trim(),
        biggestRisk: biggestRisk.trim(),
        next7DayAction: next7DayAction.trim()
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setSubmitError(err?.response?.data?.message || 'Unable to submit feedback.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading feedback workspace...</div>
  }

  if (error || !project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-3">
        <h1 className="text-2xl font-bold text-text-primary">{error || 'Venture not found'}</h1>
        <p className="text-text-secondary max-w-md">Please go back and select another venture.</p>
        <Link to={`/project/${id}`}>
          <Button variant="primary">Back to Venture Workspace</Button>
        </Link>
      </div>
    )
  }

  const validation = project.validation || {}
  const files = validation.sharedFiles || []
  const resolveFileUrl = (file) => {
    if (!file) return ''
    if (file.downloadUrl) return file.downloadUrl
    if (file.filename) return `${uploadsBaseUrl}/uploads/${file.filename}`
    return ''
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="primary">{project.category}</Badge>
            <Badge variant="default">Validation</Badge>
            {project.buildPhase?.isExtendedTimeline && <Badge variant="warning">Extended Timeline</Badge>}
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Startup Validation Review</h1>
          <p className="text-text-secondary">Give precise scorecard feedback that helps the team improve quickly.</p>
        </div>
        <Button variant="secondary" className="w-full sm:w-auto" onClick={() => navigate(`/project/${id}`)}>Back to Venture Workspace</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-text-primary mb-3">{project.title}</h2>
            <p className="text-text-secondary leading-relaxed">{project.description}</p>
            {validation.demoLink && (
              <div className="mt-4">
                <a
                  href={validation.demoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  View Demo Link
                </a>
              </div>
            )}
            {validation.demoNotes && (
              <p className="mt-3 text-sm text-text-secondary">{validation.demoNotes}</p>
            )}
            <div className="mt-4 text-sm text-text-muted">Owner: {project.owner?.name || 'Unknown'}</div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-text-primary mb-3">Venture Files</h2>
            <p className="text-sm text-text-secondary mb-4">Review shared files before submitting your decision.</p>
            {files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file._id || file.filename}
                    className="flex flex-col gap-1 rounded-lg border border-border-default bg-bg-secondary/60 p-3"
                  >
                    <a
                      href={resolveFileUrl(file)}
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {file.originalName}
                    </a>
                    <div className="text-xs text-text-muted">
                      {file.uploadedBy?.name || 'Team contributor'} · {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No validation files have been shared yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-text-primary mb-4">Your Scorecard</h2>
            {submitted ? (
              <div className="space-y-4">
                <p className="text-text-secondary">Thanks! Your validation feedback has been submitted.</p>
                <Button variant="primary" onClick={() => navigate(`/project/${id}`)}>Back to Venture Workspace</Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {SCORE_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-medium text-text-primary">{field.label}</label>
                    <p className="text-xs text-text-muted mt-1">{field.hint}</p>
                    <select
                      value={criteria[field.key]}
                      onChange={(event) => setCriteria((prev) => ({ ...prev, [field.key]: Number(event.target.value) }))}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>{value}/5</option>
                      ))}
                    </select>
                  </div>
                ))}

                <div>
                  <label className="text-sm font-medium text-text-primary">Would You Use It?</label>
                  <select
                    value={criteria.wouldUse}
                    onChange={(event) => setCriteria((prev) => ({ ...prev, wouldUse: event.target.value }))}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  >
                    <option value="yes">Yes</option>
                    <option value="maybe">Maybe</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary">Final Recommendation</label>
                  <select
                    value={criteria.finalVerdict}
                    onChange={(event) => setCriteria((prev) => ({ ...prev, finalVerdict: event.target.value }))}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  >
                    <option value="pass">Validate</option>
                    <option value="rework">Rework + Extend</option>
                    <option value="hold">Reject for Now</option>
                  </select>
                </div>

                <div className="rounded-xl border border-border-default bg-bg-secondary/70 p-3 text-sm text-text-secondary">
                  Scorecard average: <span className="font-semibold text-text-primary">{overallScore}/5</span>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary">Summary Feedback</label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Overall assessment in 2-4 lines."
                    className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary">Top 2 Strengths</label>
                  <textarea
                    rows={3}
                    value={topStrengths}
                    onChange={(event) => setTopStrengths(event.target.value)}
                    placeholder="What is working really well?"
                    className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary">Top 2 Gaps</label>
                  <textarea
                    rows={3}
                    value={topGaps}
                    onChange={(event) => setTopGaps(event.target.value)}
                    placeholder="What must be fixed before validation pass?"
                    className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary">Biggest Risk</label>
                  <textarea
                    rows={3}
                    value={biggestRisk}
                    onChange={(event) => setBiggestRisk(event.target.value)}
                    placeholder="What can make this fail fastest?"
                    className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary">One Action for Next 7 Days</label>
                  <textarea
                    rows={3}
                    value={next7DayAction}
                    onChange={(event) => setNext7DayAction(event.target.value)}
                    placeholder="Most practical next step the team should execute."
                    className="mt-2 w-full resize-none px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  />
                </div>

                {submitError && <p className="text-sm text-error">{submitError}</p>}

                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Scorecard'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
