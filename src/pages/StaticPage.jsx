import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const updated = 'Last Updated: July 15, 2026'

const pages = {
  '/about': {
    title: 'About Collab',
    intro: 'Collab is India’s pre-incubation startup ecosystem for student founders.',
    sections: [
      ['Mission', 'Help students turn ideas into incubation-ready startups through guided execution, teams, events, and venture documentation.'],
      ['Vision', 'A future where every student with a startup idea can find support, structure, and momentum without friction.'],
      ['Why Collab Exists', 'Student founders are scattered across groups, events, and informal networks. Collab brings the journey into one focused ecosystem.'],
      ['The Problem', 'Early teams often lack structure, documentation, validation habits, and access to the right events.'],
      ['The Solution', 'Collab gives teams a startup workspace, guided pipeline, events, Builder’s League programs, and progress visibility.'],
      ['Builder’s League', 'Builder’s League is Collab’s event-led pathway for students to participate, learn, and build momentum.'],
      ['Future Vision', 'Collab will continue expanding support for founders, teams, institutions, mentors, and startup programs.']
    ]
  },
  '/privacy': {
    title: 'Privacy Policy',
    intro: 'How Collab handles user, team, and venture information.',
    sections: [
      ['Information We Collect', 'Account details, college details, profile information, project content, team activity, files, and platform usage data needed to operate Collab.'],
      ['How We Use Information', 'To provide accounts, startup workspaces, team collaboration, notifications, security controls, support, and platform improvements.'],
      ['Venture Privacy', 'Private venture data, validation evidence, files, pitch decks, and internal milestones are not exposed publicly by default.'],
      ['Data Sharing', 'Collab does not sell user data. Data is shared only when required to operate the platform, follow permissions, provide support, or comply with law.'],
      ['User Control', 'Users can manage profile details, privacy preferences, project visibility, and account settings where available.'],
      ['Contact', 'For privacy questions, contact support@joincollab.org.']
    ]
  },
  '/cookies': {
    title: 'Cookie Policy',
    intro: 'How Collab uses cookies and similar browser storage.',
    sections: [
      ['Essential Cookies', 'Used for authentication, security, preferences, and keeping the platform functional.'],
      ['Preference Storage', 'Collab may store theme or interface preferences locally in the browser.'],
      ['Third-Party Services', 'Google sign-in may use its own cookies or browser storage according to Google’s policies.'],
      ['Managing Cookies', 'You can control cookies through your browser settings, but disabling essential cookies may affect login and account functionality.']
    ]
  },
  '/community-guidelines': {
    title: 'Community Guidelines',
    intro: 'Standards for a safe, serious, founder-friendly startup ecosystem.',
    sections: [
      ['Be Respectful', 'No harassment, abuse, hate, intimidation, or targeted harm.'],
      ['Build Honestly', 'Do not plagiarize, impersonate others, misrepresent work, or claim ownership of content you did not create.'],
      ['Protect Startup Work', 'Respect confidential team information, files, documents, and venture ideas shared with you.'],
      ['Use Collab Properly', 'No spam, malware, scraping, fraud, reverse engineering, or illegal activity.'],
      ['Report Issues', 'Use support or report channels if you notice harmful behavior or platform abuse.']
    ]
  },
  '/disclaimer': {
    title: 'Disclaimer',
    intro: 'Important limits about Collab’s platform and startup outcomes.',
    sections: [
      ['No Guaranteed Outcomes', 'Collab does not guarantee funding, incubation admission, customers, investment, revenue, or startup success.'],
      ['Educational & Execution Support', 'Collab provides tools, workflows, documentation, and ecosystem access to support startup preparation.'],
      ['User Responsibility', 'Founders remain responsible for their own decisions, submissions, legal obligations, and venture work.'],
      ['Platform Availability', 'Collab aims for reliability but cannot guarantee uninterrupted access at all times.']
    ]
  },
  '/help': {
    title: 'Help Center',
    intro: 'Quick support for using Collab.',
    sections: [['Getting Started', 'Create an account, start or join a venture workspace, follow the guided pipeline, and track startup progress.'], ['Need Help?', 'Contact support@joincollab.org with your account email and a clear description of the issue.']]
  },
  '/support': {
    title: 'Support',
    intro: 'Get help with account, workspace, notification, or project issues.',
    sections: [['Support Email', 'support@joincollab.org'], ['What To Include', 'Share your account email, project name if relevant, screenshots, and steps to reproduce the issue.']]
  },
  '/report-bug': {
    title: 'Report a Bug',
    intro: 'Help us fix issues faster.',
    sections: [['Bug Report Details', 'Send the page URL, device/browser, screenshots, what you expected, what happened, and steps to reproduce.'], ['Email', 'support@joincollab.org']]
  },
  '/feedback': {
    title: 'Feedback',
    intro: 'Share product feedback to help improve Collab.',
    sections: [['What To Share', 'Tell us what confused you, what helped your startup, and what would make the workflow better.'], ['Email', 'support@joincollab.org']]
  }
}

const faqs = [
  ['What is Collab?', 'A pre-incubation startup ecosystem for students and early teams.'],
  ['Is Collab free?', 'Core access is currently available for students and builders.'],
  ['Who can join?', 'Students, founders, builders, designers, developers, researchers, and innovators.'],
  ['Who owns my startup?', 'You and your team retain ownership of your startup ideas, documents, code, designs, and IP.'],
  ['Can I build with friends?', 'Yes. Collab is designed for existing student teams and venture workspaces.'],
  ['Can I participate individually?', 'Yes, individual builders can join eligible events and apply to teammate-seeking ventures.'],
  ['What is Builder’s League?', 'A Collab event pathway for builders to participate and gain momentum.'],
  ['How do I report a bug?', 'Use /report-bug or email support@joincollab.org.'],
  ['How do I delete my account?', 'Use account settings or contact support if you need help.'],
  ['How do I contact the team?', 'Use /contact or email support@joincollab.org.'],
  ['Are my files public?', 'No. Workspace files use access controls and are not shown in Discover.'],
  ['Can I change project visibility?', 'Yes, project owners can adjust visibility in workspace settings.']
]

function ContactForm() {
  const [sent, setSent] = useState(false)
  return (
    <Card hover={false} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input placeholder="Full Name" />
        <Input type="email" placeholder="Email Address" />
      </div>
      <Input placeholder="Subject" />
      <textarea className="pipeline-textarea w-full" rows={6} placeholder="Message" />
      <Button onClick={() => setSent(true)}>Send Message</Button>
      {sent && <p className="text-sm text-text-secondary">Thanks. Please also email support@joincollab.org for urgent issues.</p>}
    </Card>
  )
}

export default function StaticPage() {
  const { pathname } = useLocation()
  const page = pages[pathname] || { title: 'Page', intro: '', sections: [] }
  const isContact = pathname === '/contact'
  const isFaq = pathname === '/faq'
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-muted">{updated}</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">{isFaq ? 'Frequently Asked Questions' : page.title}</h1>
        <p className="mt-3 text-text-secondary">{isFaq ? 'Answers to common Collab questions.' : page.intro}</p>
      </div>
      {isContact && <ContactForm />}
      {isContact && <Card hover={false}><p className="text-sm text-text-secondary">Support Email: support@joincollab.org<br />Business Enquiries: support@joincollab.org<br />Sponsorships: support@joincollab.org<br />Partnerships: support@joincollab.org</p></Card>}
      {isFaq ? (
        <div className="grid gap-3">{faqs.map(([q, a]) => <Card key={q} hover={false}><h2 className="font-semibold text-text-primary">{q}</h2><p className="mt-2 text-sm text-text-secondary">{a}</p></Card>)}</div>
      ) : (
        <div className="grid gap-4">{page.sections.map(([title, body]) => <Card key={title} hover={false}><h2 className="text-lg font-semibold text-text-primary">{title}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p></Card>)}</div>
      )}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="text-primary hover:underline" to="/legal/terms-of-service">Terms</Link>
        <Link className="text-primary hover:underline" to="/privacy">Privacy</Link>
        <Link className="text-primary hover:underline" to="/cookies">Cookies</Link>
        <Link className="text-primary hover:underline" to="/community-guidelines">Guidelines</Link>
        <Link className="text-primary hover:underline" to="/disclaimer">Disclaimer</Link>
      </div>
    </div>
  )
}
