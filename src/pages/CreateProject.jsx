import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import useAuth from '../hooks/useAuth'
import { createProject, fetchProjectOptions } from '../features/projects/projectAPI'
import { getAllColleges } from '../features/college/collegeAPI'

export default function CreateProject() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [colleges, setColleges] = useState([])
  const [customRoleInput, setCustomRoleInput] = useState('')
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [showCustomRole, setShowCustomRole] = useState(false)
  const [showCustomSkill, setShowCustomSkill] = useState(false)
  const [roleOptions, setRoleOptions] = useState([])
  const [skillOptions, setSkillOptions] = useState([])
  
  const [formData, setFormData] = useState({
    title: '',
    shortPitch: '',
    description: '',
    category: '',
    tags: [],
    rolesNeeded: [],
    skillsRequired: [],
    numberOfTeammates: 1,
    visibility: 'private',
    techProduct: {
      problem: '',
      targetUsers: '',
      features: [],
      techStack: []
    },
    businessStartup: {
      marketGap: '',
      targetAudience: '',
      businessModel: '',
      revenueIdea: ''
    },
    designCreative: {
      designGoal: '',
      tools: [],
      deliverables: []
    },
    marketingContent: {
      platform: '',
      niche: '',
      contentStrategy: ''
    },
    servicesOperations: {
      serviceType: '',
      targetClients: '',
      pricing: '',
      executionPlan: ''
    },
    executionPlan: ''
  })

  const categories = [
    'Tech & Product',
    'Business & Startup',
    'Design & Creative', 
    'Marketing & Content',
    'Services & Operations'
  ]

  const visibilityLabel = (value) => {
    if (value === 'private') return 'Private (Only Team)'
    if (value === 'college') return 'College Only'
    return 'Global'
  }

  const commonRoles = [
    'Frontend', 'Backend', 'Full Stack', 'Designer', 'Product', 'Marketing',
    'Content', 'Sales', 'Operations', 'Data', 'AI/ML'
  ]

  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'Express',
    'HTML', 'CSS', 'TypeScript', 'Vue.js', 'Angular', 'Docker',
    'Git', 'AWS', 'Figma', 'Adobe Creative Suite', 'Marketing',
    'Business Development', 'Project Management', 'Data Analysis'
  ]

  const normalizeLabel = (value) => {
    if (typeof value !== 'string') return ''
    const trimmed = value.trim()
    if (!trimmed) return ''
    return trimmed
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const normalizeLabelList = (items) => {
    const list = Array.isArray(items) ? items : items ? [items] : []
    const normalized = list.map((item) => normalizeLabel(item)).filter(Boolean)
    return [...new Set(normalized)]
  }

  const mergeOptions = (base, extra) => {
    const merged = [...base, ...(extra || [])].map((item) => normalizeLabel(item)).filter(Boolean)
    return [...new Set(merged)]
  }

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await getAllColleges()
        setColleges(data)
      } catch (err) {
        console.error('Failed to fetch colleges:', err)
      }
    }
    fetchColleges()
  }, [])

  useEffect(() => {
    let isMounted = true
    const loadOptions = async () => {
      if (isMounted) {
        setRoleOptions(mergeOptions(commonRoles, []))
        setSkillOptions(mergeOptions(commonSkills, []))
      }
      try {
        const response = await fetchProjectOptions()
        const roles = response?.data?.roles || response?.roles || []
        const skills = response?.data?.skills || response?.skills || []
        if (!isMounted) return
        setRoleOptions(mergeOptions(commonRoles, roles))
        setSkillOptions(mergeOptions(commonSkills, skills))
      } catch (err) {
        console.error('Failed to fetch project options:', err)
        if (isMounted) {
          setRoleOptions(mergeOptions(commonRoles, []))
          setSkillOptions(mergeOptions(commonSkills, []))
        }
      }
    }
    loadOptions()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setCustomRoleInput('')
    setCustomSkillInput('')
    setShowCustomRole(false)
    setShowCustomSkill(false)
  }, [formData.category])

  const handleNestedChange = (e) => {
    const { name, value } = e.target
    const [category, field] = name.split('.')
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
    setError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log('handleChange:', { name, value }) // Debug
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(value) ? value : [value]
    }))
  }

  const normalizeList = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean)
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
    return []
  }

  const handleSkillChange = (e) => {
    const value = e.target.value
    if (!value) return
    if (value === '__other__') {
      setShowCustomSkill(true)
      e.target.value = ''
      return
    }
    const normalizedValue = normalizeLabel(value)
    if (normalizedValue && !formData.skillsRequired.includes(normalizedValue)) {
      handleArrayChange('skillsRequired', [...formData.skillsRequired, normalizedValue])
    }
    setShowCustomSkill(false)
  }

  const handleRoleSelect = (e) => {
    const value = e.target.value
    if (!value) return
    if (value === '__other__') {
      setShowCustomRole(true)
      e.target.value = ''
      return
    }
    const normalizedValue = normalizeLabel(value)
    if (normalizedValue && !formData.rolesNeeded.includes(normalizedValue)) {
      handleArrayChange('rolesNeeded', [...formData.rolesNeeded, normalizedValue])
    }
    setShowCustomRole(false)
  }

  const removeSkill = (skillToRemove) => {
    handleArrayChange('skillsRequired', formData.skillsRequired.filter(skill => skill !== skillToRemove))
  }

  const removeTag = (tagToRemove) => {
    handleArrayChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const removeRole = (roleToRemove) => {
    handleArrayChange('rolesNeeded', formData.rolesNeeded.filter(role => role !== roleToRemove))
  }

  const commitCustomRole = () => {
    const value = normalizeLabel(customRoleInput)
    if (!value) return
    if (!formData.rolesNeeded.includes(value)) {
      handleArrayChange('rolesNeeded', [...formData.rolesNeeded, value])
    }
    setRoleOptions((prev) => mergeOptions(prev, [value]))
    setCustomRoleInput('')
    setShowCustomRole(false)
  }

  const commitCustomSkill = () => {
    const value = normalizeLabel(customSkillInput)
    if (!value) return
    if (!formData.skillsRequired.includes(value)) {
      handleArrayChange('skillsRequired', [...formData.skillsRequired, value])
    }
    setSkillOptions((prev) => mergeOptions(prev, [value]))
    setCustomSkillInput('')
    setShowCustomSkill(false)
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      setError('')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic required fields for backend validation
    if (!formData.title || !formData.shortPitch || !formData.category || !formData.executionPlan) {
      setError('Title, short pitch, category, and execution plan are required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Clean the form data to prevent corruption
      const cleanedData = {
        title: formData.title?.trim() || '',
        shortPitch: formData.shortPitch?.trim() || '',
        description: formData.description?.trim() || formData.shortPitch?.trim() || formData.title?.trim() || '',
        category: formData.category || '',
        tags: formData.tags || [],
        rolesNeeded: normalizeLabelList(formData.rolesNeeded || []),
        skillsRequired: normalizeLabelList(formData.skillsRequired || []),
        numberOfTeammates: parseInt(formData.numberOfTeammates) || 1,
        visibility: formData.visibility || 'private',
        executionPlan: formData.executionPlan?.trim() || '',
        ...(formData.category === 'Tech & Product' && { 
          techProduct: {
            problem: formData.techProduct?.problem?.trim() || '',
            targetUsers: formData.techProduct?.targetUsers?.trim() || '',
            features: normalizeList(formData.techProduct?.features),
            techStack: normalizeList(formData.techProduct?.techStack)
          }
        }),
        ...(formData.category === 'Business & Startup' && { 
          businessStartup: {
            marketGap: formData.businessStartup?.marketGap?.trim() || '',
            targetAudience: formData.businessStartup?.targetAudience?.trim() || '',
            businessModel: formData.businessStartup?.businessModel?.trim() || '',
            revenueIdea: formData.businessStartup?.revenueIdea?.trim() || ''
          }
        }),
        ...(formData.category === 'Design & Creative' && { 
          designCreative: {
            designGoal: formData.designCreative?.designGoal?.trim() || '',
            tools: normalizeList(formData.designCreative?.tools),
            deliverables: normalizeList(formData.designCreative?.deliverables)
          }
        }),
        ...(formData.category === 'Marketing & Content' && { 
          marketingContent: {
            platform: formData.marketingContent?.platform?.trim() || '',
            niche: formData.marketingContent?.niche?.trim() || '',
            contentStrategy: formData.marketingContent?.contentStrategy?.trim() || ''
          }
        }),
        ...(formData.category === 'Services & Operations' && { 
          servicesOperations: {
            serviceType: formData.servicesOperations?.serviceType?.trim() || '',
            targetClients: formData.servicesOperations?.targetClients?.trim() || '',
            pricing: formData.servicesOperations?.pricing?.trim() || '',
            executionPlan: formData.servicesOperations?.executionPlan?.trim() || ''
          }
        })
      }
      
      console.log('Submitting cleaned data:', cleanedData) // Debug
      
      const response = await createProject(cleanedData)
      const projectId = response?.data?.project?._id || response?.data?._id || response?.project?._id
      if (!projectId) {
        throw new Error('Invalid project response')
      }
      navigate(`/project/${projectId}`)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Step 1: Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Project Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Short Pitch * (max 200 chars)
                </label>
                <textarea
                  name="shortPitch"
                  value={formData.shortPitch}
                  onChange={handleChange}
                  placeholder="Brief description of your project"
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Total Team Size (including you) *
                </label>
                <Input
                  type="number"
                  name="numberOfTeammates"
                  value={formData.numberOfTeammates}
                  onChange={handleChange}
                  min={1}
                  max={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="private">Private (Only Team)</option>
                  <option value="college">College Only</option>
                  <option value="global">Global</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Step 2: Category-Specific Details</h2>
            <p className="text-text-secondary mb-4">
              {formData.category === 'Tech & Product' && 'Describe the problem, target users, features, and tech stack.'}
              {formData.category === 'Business & Startup' && 'Describe the market gap, target audience, business model, and revenue idea.'}
              {formData.category === 'Design & Creative' && 'Describe the design goal, tools, and deliverables.'}
              {formData.category === 'Marketing & Content' && 'Describe the platform, niche, and content strategy.'}
              {formData.category === 'Services & Operations' && 'Describe the service type, target clients, pricing, and execution plan.'}
            </p>

            {formData.category === 'Tech & Product' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Problem Statement
                  </label>
                  <textarea
                    name="techProduct.problem"
                    value={formData.techProduct.problem}
                    onChange={handleNestedChange}
                    placeholder="What problem are you solving?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Target Users
                  </label>
                  <textarea
                    name="techProduct.targetUsers"
                    value={formData.techProduct.targetUsers}
                    onChange={handleNestedChange}
                    placeholder="Who are you building this for?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Key Features (comma separated)
                  </label>
                  <Input
                    type="text"
                    name="techProduct.features"
                    value={Array.isArray(formData.techProduct.features) ? formData.techProduct.features.join(', ') : formData.techProduct.features}
                    onChange={handleNestedChange}
                    placeholder="Example: Payments, Chat, Analytics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tech Stack (comma separated)
                  </label>
                  <Input
                    type="text"
                    name="techProduct.techStack"
                    value={Array.isArray(formData.techProduct.techStack) ? formData.techProduct.techStack.join(', ') : formData.techProduct.techStack}
                    onChange={handleNestedChange}
                    placeholder="Example: React, Node.js, MongoDB"
                  />
                </div>
              </div>
            )}

            {formData.category === 'Business & Startup' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Market Gap
                  </label>
                  <textarea
                    name="businessStartup.marketGap"
                    value={formData.businessStartup.marketGap}
                    onChange={handleNestedChange}
                    placeholder="What gap or opportunity did you notice?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Target Audience
                  </label>
                  <textarea
                    name="businessStartup.targetAudience"
                    value={formData.businessStartup.targetAudience}
                    onChange={handleNestedChange}
                    placeholder="Who is your primary audience?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Business Model
                  </label>
                  <textarea
                    name="businessStartup.businessModel"
                    value={formData.businessStartup.businessModel}
                    onChange={handleNestedChange}
                    placeholder="How will the business operate?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Revenue Idea
                  </label>
                  <textarea
                    name="businessStartup.revenueIdea"
                    value={formData.businessStartup.revenueIdea}
                    onChange={handleNestedChange}
                    placeholder="How will it make money?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            )}

            {formData.category === 'Design & Creative' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Design Goal
                  </label>
                  <textarea
                    name="designCreative.designGoal"
                    value={formData.designCreative.designGoal}
                    onChange={handleNestedChange}
                    placeholder="What is the design goal or vision?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tools (comma separated)
                  </label>
                  <Input
                    type="text"
                    name="designCreative.tools"
                    value={Array.isArray(formData.designCreative.tools) ? formData.designCreative.tools.join(', ') : formData.designCreative.tools}
                    onChange={handleNestedChange}
                    placeholder="Example: Figma, Adobe XD, Blender"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Deliverables (comma separated)
                  </label>
                  <Input
                    type="text"
                    name="designCreative.deliverables"
                    value={Array.isArray(formData.designCreative.deliverables) ? formData.designCreative.deliverables.join(', ') : formData.designCreative.deliverables}
                    onChange={handleNestedChange}
                    placeholder="Example: Brand kit, UI mockups, Prototype"
                  />
                </div>
              </div>
            )}

            {formData.category === 'Marketing & Content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Platform
                  </label>
                  <Input
                    type="text"
                    name="marketingContent.platform"
                    value={formData.marketingContent.platform}
                    onChange={handleNestedChange}
                    placeholder="Example: Instagram, YouTube, Blog"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Niche
                  </label>
                  <Input
                    type="text"
                    name="marketingContent.niche"
                    value={formData.marketingContent.niche}
                    onChange={handleNestedChange}
                    placeholder="Who is the audience or niche?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Content Strategy
                  </label>
                  <textarea
                    name="marketingContent.contentStrategy"
                    value={formData.marketingContent.contentStrategy}
                    onChange={handleNestedChange}
                    placeholder="Outline the content strategy"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            )}

            {formData.category === 'Services & Operations' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Service Type
                  </label>
                  <Input
                    type="text"
                    name="servicesOperations.serviceType"
                    value={formData.servicesOperations.serviceType}
                    onChange={handleNestedChange}
                    placeholder="Example: Consulting, Delivery, Operations"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Target Clients
                  </label>
                  <textarea
                    name="servicesOperations.targetClients"
                    value={formData.servicesOperations.targetClients}
                    onChange={handleNestedChange}
                    placeholder="Who needs this service?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Pricing
                  </label>
                  <Input
                    type="text"
                    name="servicesOperations.pricing"
                    value={formData.servicesOperations.pricing}
                    onChange={handleNestedChange}
                    placeholder="Example: Subscription, Per project, Commission"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Execution Plan
                  </label>
                  <textarea
                    name="servicesOperations.executionPlan"
                    value={formData.servicesOperations.executionPlan}
                    onChange={handleNestedChange}
                    placeholder="How will you deliver the service?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Step 3: Team Requirements</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Roles Needed
                </label>
                <div className="space-y-2">
                  <select
                    onChange={handleRoleSelect}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a role to add</option>
                    {roleOptions.filter((role) => !formData.rolesNeeded.includes(role)).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                    <option value="__other__">Other</option>
                  </select>
                  {showCustomRole && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="text"
                        value={customRoleInput}
                        onChange={(e) => setCustomRoleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            commitCustomRole()
                          }
                        }}
                        placeholder="Add other role"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={commitCustomRole}
                        disabled={!customRoleInput.trim()}
                        className="w-full sm:w-auto whitespace-nowrap"
                      >
                        Add Other
                      </Button>
                    </div>
                  )}
                  {formData.rolesNeeded.map((role, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={role}
                        onChange={(e) => {
                          const newRoles = [...formData.rolesNeeded]
                          newRoles[index] = e.target.value
                          handleArrayChange('rolesNeeded', newRoles)
                        }}
                        placeholder="Enter role name"
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeRole(role)}
                        className="text-error hover:text-error/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Skills Required
                </label>
                <div className="space-y-2">
                  <select
                    onChange={handleSkillChange}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a skill to add</option>
                    {skillOptions.filter((skill) => !formData.skillsRequired.includes(skill)).map((skill) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                    <option value="__other__">Other</option>
                  </select>
                  {showCustomSkill && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="text"
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            commitCustomSkill()
                          }
                        }}
                        placeholder="Add other skill"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={commitCustomSkill}
                        disabled={!customSkillInput.trim()}
                        className="w-full sm:w-auto whitespace-nowrap"
                      >
                        Add Other
                      </Button>
                    </div>
                  )}
                  {formData.skillsRequired.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...formData.skillsRequired]
                          newSkills[index] = e.target.value
                          handleArrayChange('skillsRequired', newSkills)
                        }}
                        placeholder="Enter required skill"
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-error hover:text-error/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Step 4: Execution Plan *</h2>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                What will you complete in 14 days?
              </label>
              <textarea
                name="executionPlan"
                value={formData.executionPlan}
                onChange={handleChange}
                placeholder="Describe your 14-day execution plan..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                required
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Step 5: Review & Publish</h2>
            
            <div className="bg-bg-secondary p-6 rounded-xl space-y-4">
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Project Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Category:</strong> {formData.category}</p>
                  <p><strong>Total Team Size (including you):</strong> {formData.numberOfTeammates}</p>
                  <p><strong>Visibility:</strong> {visibilityLabel(formData.visibility)}</p>
                  <p><strong>Short Pitch:</strong> {formData.shortPitch}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary mb-2">Execution Plan</h3>
                <p className="text-text-secondary whitespace-pre-wrap">{formData.executionPlan}</p>
              </div>

              {error && (
                <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 mt-6 sm:flex-row">
                <Button
                  variant="secondary"
                  onClick={prevStep}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
                
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Publishing...' : 'Publish Project'}
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-bg-main py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Card className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold text-text-primary">Create Project</h1>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(step => (
                <div
                  key={step}
                  className={`w-8 h-2 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === currentStep ? 'bg-primary text-white' : 'bg-border text-text-muted'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {renderStep()}

          <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-between">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            
            {currentStep < 5 && (
              <Button
                variant="primary"
                onClick={nextStep}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
