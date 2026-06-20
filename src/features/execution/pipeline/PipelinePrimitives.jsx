import React, { useId } from 'react'
import Button from '../../../components/common/Button'
import Badge from '../../../components/common/Badge'

export function PhaseHero({ phase, progress, themeClass }) {
  return (
    <header className={`pipeline-phase-hero ${themeClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-2">
            Phase {phase.number}
          </Badge>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">{phase.subtitle}</h2>
          <p className="text-sm text-text-secondary mt-2 max-w-xl">{phase.goal}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{progress}%</p>
          <p className="text-xs text-text-muted">complete</p>
        </div>
      </div>
      <div className="progress-bar mt-4 h-2">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </header>
  )
}

export function QuestionCard({ number, title, why, example, children, complete }) {
  const headingId = useId()
  return (
    <section
      className={`pipeline-question-card ${complete ? 'pipeline-question-card--done' : ''}`}
      aria-labelledby={headingId}
    >
      <div className="pipeline-question-card-header">
        <span className="pipeline-question-number">{number}</span>
        <div className="min-w-0 flex-1">
          <h3 id={headingId} className="text-base font-semibold text-text-primary">{title}</h3>
          {why && <p className="text-xs text-text-muted mt-1 leading-relaxed">{why}</p>}
          {example && (
            <p className="text-xs text-text-secondary mt-2 italic border-l-2 border-primary/30 pl-3">
              Example: {example}
            </p>
          )}
        </div>
        {complete && <Badge variant="success">Saved</Badge>}
      </div>
      <div className="pipeline-question-card-body mt-4">{children}</div>
    </section>
  )
}

export function FieldLabel({ htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium text-text-primary">{children}</span>
      {hint && <span className="block text-xs text-text-muted mt-0.5">{hint}</span>}
    </label>
  )
}

export function TextInput({ id, value, onChange, placeholder, large }) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`pipeline-input w-full ${large ? 'pipeline-input--lg text-lg font-semibold' : ''}`}
    />
  )
}

export function TextArea({ id, value, onChange, placeholder, rows = 4, large }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`pipeline-textarea w-full ${large ? 'pipeline-textarea--lg' : ''}`}
    />
  )
}

export function SavePhaseBar({ saving, onSave, label = 'Save phase answers' }) {
  return (
    <div className="pipeline-save-bar">
      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : label}
      </Button>
      <p className="text-xs text-text-muted mt-2">
        Answers are saved to your startup workspace and feed your incubation documents.
      </p>
    </div>
  )
}

export const isValidShareLink = (value) => {
  const trimmed = String(value || '').trim()
  return !trimmed || /^https?:\/\/[^\s]+\.[^\s]+/.test(trimmed)
}

export function ProofBlock({ title, why, proofNeeded, children, complete }) {
  return (
    <section className={`pipeline-proof-block ${complete ? 'pipeline-proof-block--done' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <p className="text-xs text-text-secondary mt-1">{why}</p>
        </div>
        {complete && <Badge variant="success">Proof added</Badge>}
      </div>
      <p className="text-xs text-text-muted mb-4 rounded-lg bg-bg-secondary/50 border border-border px-3 py-2">
        <strong className="text-text-secondary">Proof needed:</strong> {proofNeeded}
      </p>
      {children}
    </section>
  )
}

export function LinkProofRow({ label, value, onChange, placeholder }) {
  const id = useId()
  const trimmed = value.trim()
  const hasInvalidUrl = trimmed && !isValidShareLink(trimmed)
  return (
    <div className="mb-3">
      <FieldLabel htmlFor={id} hint="Paste a shareable link">{label}</FieldLabel>
      <input
        id={id}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        pattern="https?://.+"
        aria-invalid={hasInvalidUrl}
        className={`pipeline-input w-full mt-1.5 ${hasInvalidUrl ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
      />
      {hasInvalidUrl && (
        <p className="mt-1 text-xs text-error">Enter a valid link starting with https:// or http://</p>
      )}
    </div>
  )
}

export function FileProofZone({ hint, onFile, accept }) {
  return (
    <label className="pipeline-file-zone">
      <input type="file" className="sr-only" accept={accept} onChange={(e) => onFile(e.target.files?.[0])} />
      <span className="text-sm font-medium text-text-primary">Upload proof</span>
      <span className="text-xs text-text-muted mt-1 block">{hint}</span>
    </label>
  )
}
