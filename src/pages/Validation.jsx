import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { motion } from 'framer-motion'
import { fetchValidations } from '../features/validation/validationAPI'

function ValidationCard({ project, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card>
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <Badge variant="primary" className="mb-3">{project.category}</Badge>
            <h3 className="text-lg font-semibold text-text-primary mb-3">{project.title}</h3>
            <p className="text-text-secondary text-sm mb-3">{project.shortPitch || project.description}</p>
            <div className="text-xs text-text-muted">Owner: {project.owner?.name || 'Unknown'}</div>
            <div className="mt-2 text-xs text-text-muted">
              {project.validation?.currentReviews || 0}/{project.validation?.reviewsRequired || 30} reviews · Avg {project.validation?.averageRating || 0}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={`/project/${project._id}`} className="flex-1">
              <Button variant="primary" className="w-full">View Project</Button>
            </Link>
            <Link to={`/validation/${project._id}/feedback`} className="flex-1">
              <Button variant="secondary" className="w-full">Give Feedback</Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function Validation() {
  const [validations, setValidations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadValidations = async () => {
      try {
        const response = await fetchValidations()
        const list = response?.data?.projects || response?.projects || []
        setValidations(list)
      } catch (err) {
        console.error('Failed to load validation projects:', err)
        setError('Unable to load validation projects.')
      } finally {
        setLoading(false)
      }
    }

    loadValidations()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Validation Playground</h1>
          <p className="text-text-secondary">Test your ideas and get feedback from real users</p>
        </div>
        <Link to="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-border-default bg-bg-secondary p-10 text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-3">Loading validation tasks...</h2>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-error/40 bg-error/10 p-6 text-center text-error">
          {error}
        </div>
      ) : validations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-default bg-bg-secondary p-10 text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-3">No validation tasks yet</h2>
          <p className="text-text-secondary mb-6">
            Start by creating a new project. Then use this section to add validation tasks.
          </p>
          <Link to="/create">
            <Button variant="primary">Create Project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validations.map((project, index) => (
            <ValidationCard key={project._id || index} project={project} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
