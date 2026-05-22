import React from 'react'
import { Link } from 'react-router-dom'

const docs = [
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    description: 'Rules and conditions for using Collab.'
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your data.'
  },
  {
    slug: 'ip-ownership-policy',
    title: 'IP & Ownership Policy',
    description: 'You keep full ownership of your venture concepts and work.'
  },
  {
    slug: 'security-policy',
    title: 'Security Policy',
    description: 'How Collab secures accounts and venture data.'
  },
  {
    slug: 'ecosystem-guidelines',
    title: 'Ecosystem Guidelines',
    description: 'Professional standards for collaboration.'
  },
  {
    slug: 'dispute-resolution',
    title: 'Dispute Resolution',
    description: 'How we handle conflicts and ownership claims.'
  }
]

export default function Legal() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">Legal & Policies</h1>
        <p className="text-text-secondary max-w-2xl">
          Transparent rules and protections to keep ventures safe and ownership clear.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => (
          <Link key={doc.slug} to={`/legal/${doc.slug}`} className="group">
            <div className="rounded-2xl border border-border bg-bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-lg font-semibold text-text-primary group-hover:text-primary">
                {doc.title}
              </h2>
              <p className="text-sm text-text-secondary mt-2">
                {doc.description}
              </p>
              <div className="mt-4 text-xs text-text-muted">
                View policy →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
