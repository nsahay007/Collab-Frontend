import React from 'react'
import Card from '../components/common/Card'

const sections = [
  {
    title: 'Startup ownership',
    text: 'Startup concepts, documents, validation evidence, pitch decks, files, and project content remain owned by the founders and team members who create them. COLLAB does not claim ownership of venture content.'
  },
  {
    title: 'Workspace privacy',
    text: 'Startup workspaces use project ownership and team-member access checks so internal venture details are limited to the startup team and authorized administrators.'
  },
  {
    title: 'Account protection',
    text: 'COLLAB uses JWT-based authentication, email verification, OTP-based password reset, rate limiting on authentication actions, and admin two-factor authentication support.'
  },
  {
    title: 'File protection',
    text: 'Project uploads are validated by file type and size. Downloads use signed links and project access checks instead of exposing the uploads folder publicly.'
  },
  {
    title: 'Platform transparency',
    text: 'Administrative areas are role-protected. Project ownership, team access, package exports, and certificates are tied to stored venture records.'
  }
]

export default function Security() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-text-muted">Trust & Transparency</p>
        <h1 className="text-3xl font-bold text-text-primary">How COLLAB protects founders</h1>
        <p className="max-w-3xl text-text-secondary">
          A plain-language overview of the protections currently implemented across accounts, workspaces, files, and startup ownership.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} hover={false}>
            <h2 className="text-lg font-semibold text-text-primary">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{section.text}</p>
          </Card>
        ))}
      </div>

      <Card hover={false} className="border-primary/20">
        <h2 className="text-lg font-semibold text-text-primary">Responsible disclosure</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          If you find a security or privacy issue, contact COLLAB support with clear reproduction steps so the team can review and resolve it responsibly.
        </p>
      </Card>
    </div>
  )
}
