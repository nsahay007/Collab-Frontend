const field = (key, label, min = 8, max = 12, editable = true) => ({ key, label, minFont: min, maxFont: max, editable })
const card = (key, label, min = 8, max = 12) => ({ key, label, minFont: min, maxFont: max, type: 'card' })
const list = (key, label, min = 8, max = 11, type = 'list') => ({ key, label, minFont: min, maxFont: max, type })

export const packageDocuments = [
  {
    id: 'identity',
    title: 'Startup Identity Card',
    number: 1,
    fields: [
      field('startupName', 'Startup name', 24, 34),
      field('tagline', 'Tagline', 12, 16),
      field('category', 'Category', 9, 12),
      list('descriptorWords', 'Descriptor words', 7, 10, 'chips'),
      field('currentStage', 'Current stage', 10, 14),
      field('founderName', 'Founder name', 11, 16),
      field('teamMemberCount', 'Team member count', 14, 20),
      field('dateCreated', 'Date created', 9, 12),
      field('milestoneCompletionCount', 'Milestone completion count', 10, 14),
      field('elevatorPitch', 'Elevator pitch', 8, 11),
      field('problemStatement', 'Problem statement', 7, 10),
    ],
    metric: field('readinessScore', 'Readiness score', 20, 30),
  },
  {
    id: 'problem',
    title: 'Problem Statement Brief',
    number: 2,
    fields: [
      field('startupName', 'Startup name', 14, 18),
      field('problemStatement', 'Problem statement', 8, 11),
      field('targetUsers', 'Target users', 8, 11),
      field('whyThisMatters', 'Why this matters', 8, 11),
      field('founderInspiration', 'Founder inspiration', 8, 11),
      field('impactStatement', 'Impact statement', 8, 11),
    ],
  },
  { id: 'team', title: 'Team Roster', number: 3, type: 'team' },
  {
    id: 'incubation',
    title: 'Incubation Application',
    number: 4,
    declaration: true,
    fields: [
      field('startupName', 'Startup name', 20, 30),
      field('tagline', 'Tagline', 12, 16),
      field('category', 'Category', 9, 12),
      field('currentStage', 'Current stage', 9, 12),
      field('readinessScore', 'Readiness score out of 100', 9, 12),
      field('founderName', 'Founder name', 11, 16),
      field('collegeInstitution', 'College / institution', 10, 15),
      field('dateGenerated', 'Date generated', 8, 11),
    ],
  },
  {
    id: 'validation',
    title: 'Validation Report',
    number: 5,
    fields: [
      field('surveyNotes', 'Survey notes', 8, 11),
      list('surveyLinksFiles', 'Survey links / files', 7, 10, 'filecards'),
      field('interviewNotes', 'Interview notes', 8, 11),
      list('interviewLinksFiles', 'Interview links / files', 7, 10, 'filecards'),
      field('feedbackNotes', 'Feedback notes', 8, 11),
      list('feedbackLinksFiles', 'Feedback links / files', 7, 10, 'filecards'),
      field('repeatedProblems', 'Repeated problems', 8, 11),
      field('surprisingInsights', 'Surprising insights', 8, 11),
      list('validationEvidence', 'Validation evidence', 7, 10, 'filecards'),
    ],
  },
  {
    id: 'mvp',
    title: 'MVP Showcase',
    number: 6,
    fields: [
      field('startupName', 'Startup name', 18, 28),
      field('mvpRoadmap', 'MVP roadmap', 7, 10),
      list('completedMilestones', 'Completed milestones', 8, 11, 'checklist'),
      card('demoLink', 'Demo link', 7, 10),
      card('githubLink', 'GitHub link', 7, 10),
      card('figmaDesignLink', 'Figma / design link', 7, 10),
      list('uploadedPrototypeFiles', 'Uploaded prototype files', 7, 10, 'filecards'),
      field('mvpSummary', 'MVP summary', 8, 11),
      field('currentProductStatus', 'Current product status', 10, 14),
    ],
  },
  {
    id: 'provenance',
    title: 'Venture Provenance Report',
    number: 7,
    report: true,
    fields: [
      field('startupInformation', 'Startup information', 8, 11),
      field('founderInformation', 'Founder information', 8, 11),
      list('team', 'Team members', 8, 11, 'teamlist'),
      field('dateCreated', 'Creation date', 9, 12),
      field('milestoneStatistics', 'Milestone statistics', 10, 14),
      list('completedMilestones', 'Completed milestones', 8, 11, 'checklist'),
      field('validationStatistics', 'Validation statistics', 10, 14),
      field('uploadedEvidenceCount', 'Uploaded evidence count', 10, 14),
      field('readinessScore', 'Readiness score out of 100', 14, 22),
      field('currentStage', 'Current startup stage', 10, 14),
    ],
  },
  { id: 'summary', title: 'Document Summary', number: 8, type: 'summary' },
]

export const fieldsByDocument = Object.fromEntries(
  packageDocuments.map((doc) => [doc.id, (doc.fields || []).map((item) => item.key)])
)
