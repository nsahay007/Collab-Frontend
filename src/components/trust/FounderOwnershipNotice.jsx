import React from 'react'

export default function FounderOwnershipNotice({ compact = false }) {
  return (
    <div className={`rounded-2xl border border-primary/20 bg-primary/10 ${compact ? 'px-4 py-3' : 'p-5'}`}>
      <p className="text-xs uppercase tracking-wide text-primary mb-1">Founder Ownership</p>
      <p className="text-sm leading-relaxed text-text-secondary">
        All startup concepts, documents, files, validation evidence, pitch decks, and project content remain the intellectual property of their respective founders and team members. COLLAB does not claim ownership of venture content.
      </p>
    </div>
  )
}
