import React from 'react'

export function NarrativeSection({ eyebrow, title, children, action }) {
  return (
    <section className="ecosystem-section">
      <div>
        {eyebrow && <p className="ecosystem-eyebrow">{eyebrow}</p>}
        <h1 className="ecosystem-title">{title}</h1>
        {children && <p className="ecosystem-copy">{children}</p>}
      </div>
      {action}
    </section>
  )
}

export function InsightPanel({ label, value, detail, tone = 'cyan' }) {
  return (
    <div className={`insight-panel insight-panel--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <p>{detail}</p>}
    </div>
  )
}

export function MomentumStrip({ items = [] }) {
  return (
    <div className="momentum-strip">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="momentum-step">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{item.label}</strong>
          {item.detail && <p>{item.detail}</p>}
        </div>
      ))}
    </div>
  )
}

export function ActivityPulse({ title, meta, children }) {
  return (
    <div className="activity-pulse">
      <i />
      <div>
        <strong>{title}</strong>
        {meta && <span>{meta}</span>}
        {children && <p>{children}</p>}
      </div>
    </div>
  )
}

export function SignalFeed({ signals = [] }) {
  return (
    <div className="signal-feed">
      {signals.map((signal, index) => (
        <ActivityPulse key={`${signal.title}-${index}`} title={signal.title} meta={signal.meta}>
          {signal.detail}
        </ActivityPulse>
      ))}
    </div>
  )
}

export function ContextCluster({ title, subtitle, children }) {
  return (
    <div className="context-cluster">
      <div className="context-cluster-head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function VentureNode({ title, stage, detail, onClick }) {
  return (
    <button type="button" className="venture-node" onClick={onClick}>
      <span>{stage || 'Venture'}</span>
      <strong>{title}</strong>
      {detail && <p>{detail}</p>}
    </button>
  )
}
