import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { getProjectById } from '../features/project/projectAPI'
import { submitValidation } from '../features/validation/validationAPI'

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001'
const uploadsBase = apiBase.replace(/\/api\/?$/, '')

export default function GiveFeedback() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
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
        setError(err?.response?.data?.message || 'Unable to load project.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProject()
    }
  }, [id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!feedback.trim()) {
      setSubmitError('Please share your feedback before submitting.')
      return
    }

    try {
      setSubmitting(true)
      await submitValidation({
        projectId: id,
        rating: Number(rating),
        feedback: feedback.trim()
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
        <h1 className="text-2xl font-bold text-text-primary">{error || 'Project not found'}</h1>
        <p className="text-text-secondary max-w-md">Please go back and select another project.</p>
        <Link to="/validation">
          <Button variant="primary">Back to Validation</Button>
        </Link>
      </div>
    )
  }

  const validation = project.validation || {}
  const files = validation.sharedFiles || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="primary">{project.category}</Badge>
            <Badge variant="default">Validation</Badge>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Give Feedback</h1>
          <p className="text-text-secondary">Help this team refine their idea with honest, constructive input.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/validation')}>Back to Validation</Button>
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
            <div className="mt-4 text-sm text-text-muted">
              Owner: {project.owner?.name || 'Unknown'}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-text-primary mb-3">Project Files</h2>
            <p className="text-sm text-text-secondary mb-4">Download any shared files to review the work-in-progress.</p>
            {files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file._id || file.filename}
                    className="flex flex-col gap-1 rounded-lg border border-border-default bg-bg-secondary/60 p-3"
                  >
                    <a
                      href={`${uploadsBase}/uploads/${file.filename}`}
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {file.originalName}
                    </a>
                    <div className="text-xs text-text-muted">
                      {file.uploadedBy?.name || 'Team member'} · {(file.size / 1024).toFixed(1)} KB
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
            <h2 className="text-xl font-bold text-text-primary mb-4">Your Review</h2>
            {submitted ? (
              <div className="space-y-4">
                <p className="text-text-secondary">Thanks for helping this team. Your feedback has been submitted.</p>
                <Button variant="primary" onClick={() => navigate('/validation')}>Explore More Projects</Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium text-text-primary">Rating</label>
                  <select
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>{value} Star{value > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary">Feedback</label>
                  <textarea
                    rows={5}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="What did you like? What would you improve?"
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
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </form>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Review Tips</h3>
            <p className="text-sm text-text-secondary">
              Be specific, actionable, and kind. Mention what excites you and what feels unclear.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
