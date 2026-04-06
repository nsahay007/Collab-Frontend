import React from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

import terms from '../legal/terms-of-service.md?raw'
import privacy from '../legal/privacy-policy.md?raw'
import ipPolicy from '../legal/ip-ownership-policy.md?raw'
import security from '../legal/security-policy.md?raw'
import guidelines from '../legal/community-guidelines.md?raw'
import dispute from '../legal/dispute-resolution.md?raw'

const DOCS = {
  'terms-of-service': { title: 'Terms of Service', body: terms },
  'privacy-policy': { title: 'Privacy Policy', body: privacy },
  'ip-ownership-policy': { title: 'IP & Ownership Policy', body: ipPolicy },
  'security-policy': { title: 'Security Policy', body: security },
  'community-guidelines': { title: 'Community Guidelines', body: guidelines },
  'dispute-resolution': { title: 'Dispute Resolution', body: dispute }
}

export default function LegalDoc() {
  const { slug } = useParams()
  const doc = DOCS[slug]

  if (!doc) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-text-primary">Policy not found</h1>
        <p className="text-text-secondary">The document you’re looking for doesn’t exist.</p>
        <Link to="/legal" className="text-primary text-sm">Back to Legal</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/legal" className="text-sm text-primary">← Back to Legal</Link>
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">{doc.title}</h1>
      </div>

      <div className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
        <ReactMarkdown className="prose prose-slate dark:prose-invert max-w-none">
          {doc.body}
        </ReactMarkdown>
      </div>
    </div>
  )
}
