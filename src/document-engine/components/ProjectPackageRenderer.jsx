import React from 'react'
import '../styles/projectPackage.css'

export const hasValue = (value) => Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== ''

const smartSize = (value, min, max) => {
  const len = Array.isArray(value) ? value.join(' ').length : String(value || '').length
  if (len > 700) return min
  if (len > 220) return Math.max(min, max - 2)
  if (len > 90) return Math.max(min, max - 1)
  return max
}

function EditableValue({ item, value, onChange, readOnly = false }) {
  if (!hasValue(value)) return null
  const fontSize = smartSize(value, item.minFont, item.maxFont)
  if (!item.editable || readOnly) return <div className="pp-value" style={{ fontSize }}>{String(value)}</div>
  return (
    <div
      className="pp-value pp-editable"
      style={{ fontSize }}
      contentEditable
      suppressContentEditableWarning
      onBlur={(event) => onChange(item.key, event.currentTarget.textContent)}
    >
      {String(value)}
    </div>
  )
}

function FieldBox({ item, data, onChange, value: forcedValue, continued = false }) {
  const value = forcedValue ?? data[item.key]
  if (!hasValue(value)) return null
  if (item.type === 'chips') {
    return <div className="pp-box"><span>{item.label}</span><div className="pp-chips">{value.map((chip) => <b key={chip}>{chip}</b>)}</div></div>
  }
  if (item.type === 'filecards') {
    return <div className="pp-box"><span>{item.label}</span><div className="pp-filegrid">{value.map((file) => <div className="pp-file" key={file}>File: {file}</div>)}</div></div>
  }
  if (item.type === 'checklist') {
    return <div className="pp-box"><span>{item.label}</span>{value.map((entry) => <div className="pp-check" key={entry}>Done: {entry}</div>)}</div>
  }
  if (item.type === 'teamlist') {
    return <div className="pp-box"><span>{item.label}</span>{value.map((member) => <div className="pp-check" key={`${member.name}-${member.email}`}>{member.name} - {member.role}</div>)}</div>
  }
  if (item.type === 'card') {
    return <div className="pp-box pp-linkcard"><span>{item.label}</span><EditableValue item={item} value={value} onChange={onChange} /></div>
  }
  return <div className="pp-box"><span>{continued ? `${item.label} continued` : item.label}</span><EditableValue item={item} value={value} onChange={onChange} readOnly={continued} /></div>
}

function PageShell({ doc, children, page = 1 }) {
  return (
    <section className="pp-page">
      <header className="pp-head"><span>COLLAB PRE-INCUBATION PLATFORM</span><span>STARTUP</span></header>
      <h2>{doc.number}. {doc.title}{page > 1 ? ` / PAGE ${page}` : ''}</h2>
      <div className="pp-line" />
      <div className="pp-content">{children}</div>
      <footer className="pp-foot"><span>Prepared via Collab Pre-Incubation Pipeline</span><span>PAGE {page} - CONFIDENTIAL</span></footer>
    </section>
  )
}

const splitText = (text, size = 1200) => {
  const value = String(text || '')
  if (value.length <= size) return [value]
  const chunks = []
  let rest = value
  while (rest.length) {
    let cut = rest.length > size ? rest.lastIndexOf(' ', size) : rest.length
    if (cut < size * 0.55) cut = Math.min(size, rest.length)
    chunks.push(rest.slice(0, cut).trim())
    rest = rest.slice(cut).trim()
  }
  return chunks
}

const paginateFields = (fields, data) => {
  const pages = [[]]
  let used = 0
  fields.forEach((item) => {
    const value = data[item.key]
    if (!hasValue(value)) return
    const parts = typeof value === 'string' && value.length > 1200 ? splitText(value) : [value]
    parts.forEach((part, index) => {
      const cost = Array.isArray(part) ? 500 + part.length * 80 : 320 + String(part).length
      if (used + cost > 2600 && pages[pages.length - 1].length) {
        pages.push([])
        used = 0
      }
      pages[pages.length - 1].push({ item, value: part, continued: index > 0 })
      used += cost
    })
  })
  return pages
}

function TeamDocument({ doc, data }) {
  const rows = data.team || []
  return <PageShell doc={doc}><table className="pp-table"><thead><tr><th>Role</th><th>Name</th><th>Email</th><th>User ID</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.email}-${row.userId}`}><td>{row.role}</td><td>{row.name}</td><td>{row.email}</td><td>{row.userId}</td></tr>)}</tbody></table><div className="pp-note">Note: Add multiple team members as needed.</div></PageShell>
}

function SummaryDocument({ doc }) {
  return <PageShell doc={doc}><div className="pp-summary"><h3>Purpose</h3><p>A complete overview of your startup’s journey, from idea to validation and beyond.</p><h3>Use</h3><p>Share with mentors, investors, and incubators to showcase your progress.</p><h3>Integrity</h3><p>All information is submitted in good faith and represents the current status.</p></div><div className="pp-note pp-summary-note">Keep this information updated to reflect your latest progress.</div></PageShell>
}

export default function ProjectPackageRenderer({ document, data, onChange }) {
  if (document.type === 'team') return <TeamDocument doc={document} data={data} />
  if (document.type === 'summary') return <SummaryDocument doc={document} />
  const fields = (document.fields || []).filter((item) => hasValue(data[item.key]))
  if (document.id !== 'identity' && !document.declaration) {
    return paginateFields(fields, data).map((pageFields, index) => (
      <PageShell key={`${document.id}-${index}`} doc={document} page={index + 1}>
        <div className="pp-stack">
          {pageFields.map(({ item, value, continued }) => <FieldBox key={`${item.key}-${continued}-${String(value).slice(0, 12)}`} item={item} data={data} value={value} continued={continued} onChange={onChange} />)}
        </div>
      </PageShell>
    ))
  }
  return (
    <PageShell doc={document}>
      {document.id === 'identity' && document.metric && hasValue(data.readinessScore) && (
        <div className="pp-identity-grid">
          <div>{fields.slice(0, 4).map((item) => <FieldBox key={item.key} item={item} data={data} onChange={onChange} />)}</div>
          <div className="pp-score"><span>Readiness Score</span><strong>{data.readinessScore}</strong><small>out of 100</small></div>
        </div>
      )}
      <div className={document.id === 'identity' ? 'pp-grid' : 'pp-stack'}>
        {(document.id === 'identity' ? fields.slice(4) : fields).map((item) => <FieldBox key={item.key} item={item} data={data} onChange={onChange} />)}
      </div>
      {document.declaration && hasValue(data.declarationText) && <div className="pp-declaration"><span>Declaration text</span><p>{data.declarationText}</p></div>}
      {document.declaration && <div className="pp-signatures"><span>Founder Signature</span><span>Co-Founder Signature</span><span>Faculty Mentor Signature</span></div>}
    </PageShell>
  )
}
