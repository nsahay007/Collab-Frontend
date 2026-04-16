import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { motion } from 'framer-motion'
import { fetchProjects, expressInterest, fetchProjectOptions } from '../features/projects/projectAPI'
import useAuth from '../hooks/useAuth'
import { getAllColleges } from '../features/college/collegeAPI'
import checkIcon from '../assets/icons/check.svg'
import launchIcon from '../assets/icons/launch.svg'

function ProjectCard({ project, isMine, onInterest }) {
  const status = project.status || 'planning'
  const statusLabel = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
  const statusVariant = status === 'validated' || status === 'completed'
    ? 'success'
    : status === 'building'
      ? 'primary'
      : status === 'validation_failed'
        ? 'warning'
        : 'default'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full group">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">{project.title}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant}>{statusLabel}</Badge>
                {project.validation?.featuredAt && (
                  <Badge variant="accent">Featured</Badge>
                )}
                {project.buildPhase?.isExtendedTimeline && (
                  <Badge variant="warning">Extended</Badge>
                )}
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(project.rolesNeeded || []).map((role, i) => (
                <Badge 
                  key={i} 
                  variant="accent"
                  className="text-xs"
                >
                  {role}
                </Badge>
              ))}
            </div>
            <div className="space-y-2 text-sm text-text-muted mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-accent flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {project.owner?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span>Owner: {project.owner?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span>{project.teamMembers?.length || 0} team member{(project.teamMembers?.length || 0) !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Link to={`/project/${project._id}`}>
              <Button 
                variant="secondary" 
                className="w-full"
              >
                View Project
              </Button>
            </Link>
            {!isMine && !project.isInterested && (
              <Button 
                variant="primary" 
                className="w-full" 
                onClick={() => onInterest(project._id)}
              >
                Show Interest
              </Button>
            )}
            {!isMine && project.isInterested && (
              <Button 
                variant="default" 
                className="w-full" 
                disabled
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <img src={checkIcon} alt="Sent" className="h-4 w-4" />
                  Interest Sent
                </span>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const userId = user?._id || user?.id
  const currentYear = new Date().getFullYear()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [colleges, setColleges] = useState([])
  const [filters, setFilters] = useState({
    college: 'all',
    category: 'all',
    status: 'all',
    skills: 'all',
    roles: 'all'
  })

  const categoryOptions = [
    'Tech & Product',
    'Business & Startup',
    'Design & Creative',
    'Marketing & Content',
    'Services & Operations'
  ]

  const statusOptions = ['all', 'planning', 'building', 'validation', 'validation_failed', 'validated', 'completed']

  const baseSkillOptions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'Express',
    'HTML', 'CSS', 'TypeScript', 'Vue.js', 'Angular', 'Docker',
    'Git', 'AWS', 'Figma', 'Adobe Creative Suite', 'Marketing',
    'Business Development', 'Project Management', 'Data Analysis'
  ]

  const baseRoleOptions = [
    'Frontend', 'Backend', 'Full Stack', 'Designer', 'Product', 'Marketing',
    'Content', 'Sales', 'Operations', 'Data', 'AI/ML'
  ]

  const normalizeLabel = (value) => {
    if (typeof value !== 'string') return ''
    const trimmed = value.trim()
    if (!trimmed) return ''
    return trimmed
      .split(/\\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const mergeOptions = (base, extra) => {
    const merged = [...base, ...(extra || [])].map((item) => normalizeLabel(item)).filter(Boolean)
    return [...new Set(merged)]
  }

  const [roleOptions, setRoleOptions] = useState(mergeOptions(baseRoleOptions, []))
  const [skillOptions, setSkillOptions] = useState(mergeOptions(baseSkillOptions, []))


  const loadProjects = async (nextFilters = filters) => {
    try {
      const response = await fetchProjects(nextFilters)
      const list = response?.data?.projects || response?.projects || response?.data || []
      if (Array.isArray(list)) {
        const mapped = list.map((project) => ({
          ...project,
          isInterested: project.interestedUsers?.some((u) => u._id === userId || u.id === userId),
          isMine: project.owner?._id === userId || project.owner?.id === userId
        }))
        setProjects(mapped)
      } else {
        setError('Unable to load projects.')
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
      setError('Unable to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    const collegeId = user.college?.id || user.college_id
    if (collegeId && filters.college === 'all') {
      const nextFilters = { ...filters, college: collegeId }
      setFilters(nextFilters)
      loadProjects(nextFilters)
    } else {
      loadProjects()
    }
  }, [user])

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await getAllColleges()
        if (Array.isArray(data)) {
          setColleges(data)
        }
      } catch (err) {
        console.error('Failed to fetch colleges:', err)
      }
    }
    fetchColleges()
  }, [])

  useEffect(() => {
    let mounted = true
    const loadOptions = async () => {
      try {
        const response = await fetchProjectOptions()
        const roles = response?.data?.roles || response?.roles || []
        const skills = response?.data?.skills || response?.skills || []
        if (!mounted) return
        setRoleOptions(mergeOptions(baseRoleOptions, roles))
        setSkillOptions(mergeOptions(baseSkillOptions, skills))
      } catch (err) {
        console.error('Failed to load role/skill options:', err)
      }
    }
    loadOptions()
    return () => {
      mounted = false
    }
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSkillsChange = (e) => {
    setFilters((prev) => ({ ...prev, skills: e.target.value }))
  }

  const handleRolesChange = (e) => {
    setFilters((prev) => ({ ...prev, roles: e.target.value }))
  }

  const applyFilters = () => {
    setLoading(true)
    loadProjects(filters)
  }

  const clearFilters = () => {
    const reset = { college: 'all', category: 'all', status: 'all', skills: 'all', roles: 'all' }
    setFilters(reset)
    setLoading(true)
    loadProjects(reset)
  }

  const handleInterest = async (projectId) => {
    if (!userId) return

    try {
      await expressInterest(projectId, userId)
      await loadProjects()
    } catch (err) {
      console.error('Interest registration failed:', err)
    }
  }

  if (loading) {
    return <div>Loading projects...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text-primary mb-2"
          >
            Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary"
          >
            Discover and join exciting projects
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/create">
            <Button variant="primary" className="w-full sm:w-auto text-sm px-4 py-2 sm:text-base sm:px-6 sm:py-3">
              Create Project
            </Button>
          </Link>
        </motion.div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">College</label>
            <select
              name="college"
              value={filters.college}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All colleges</option>
              {colleges.map((college) => (
                <option key={college._id} value={college._id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all'
                    ? 'All statuses'
                    : status
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Skills</label>
            <select
              value={filters.skills}
              onChange={handleSkillsChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All skills</option>
              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Roles Needed</label>
            <select
              value={filters.roles}
              onChange={handleRolesChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-4 sm:flex-row">
          <Button variant="primary" className="w-full sm:w-auto" onClick={applyFilters}>Apply Filters</Button>
          <Button variant="secondary" className="w-full sm:w-auto" onClick={clearFilters}>Clear</Button>
        </div>
      </Card>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error/10 border border-error/30 p-4 rounded-xl"
        >
          <p className="text-error font-medium">{error}</p>
        </motion.div>
      )}

      {projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-card border-2 border-dashed border-border p-12 text-center rounded-xl"
        >
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <img src={launchIcon} alt="Launch icon" className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">No projects yet</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            You're starting with a completely fresh workspace. Create the first project to begin your entrepreneurial journey.
          </p>
          <Link to="/create">
            <Button variant="primary">
              Create Your First Project
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProjectCard
                project={project}
                isMine={project.isMine}
                onInterest={handleInterest}
              />
            </motion.div>
          ))}
        </div>
      )}

      <div className="pt-6 text-center text-xs text-text-muted">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>© {currentYear} Collab. All rights reserved.</span>
          <span className="hidden sm:inline">•</span>
          <Link to="/legal" className="hover:text-text-primary transition-colors">
            Legal & Policies
          </Link>
        </div>
      </div>
    </div>
  )
}
