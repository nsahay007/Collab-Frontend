import { packageDocuments } from '../templates/projectPackageTemplates'

const encoder = new TextEncoder()
const clean = (name = 'document') => String(name).replace(/[^a-z0-9-_]+/gi, '_').replace(/^_+|_+$/g, '') || 'document'
const hasValue = (value) => Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== ''
const esc = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]))

let crcTable
const crc32 = (bytes) => {
  crcTable ||= Array.from({ length: 256 }, (_, n) => {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
  })
  let crc = -1
  bytes.forEach((byte) => { crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff] })
  return (crc ^ -1) >>> 0
}

const u16 = (value) => [value & 255, (value >>> 8) & 255]
const u32 = (value) => [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]

export const makeZip = (files) => {
  const locals = []
  const centrals = []
  let offset = 0
  files.forEach(({ name, content }) => {
    const filename = encoder.encode(name)
    const bytes = content instanceof Uint8Array ? content : encoder.encode(content)
    const crc = crc32(bytes)
    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(bytes.length), ...u32(bytes.length), ...u16(filename.length), ...u16(0),
      ...filename, ...bytes
    ])
    const central = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(bytes.length), ...u32(bytes.length), ...u16(filename.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...filename
    ])
    locals.push(local)
    centrals.push(central)
    offset += local.length
  })
  const centralSize = centrals.reduce((sum, file) => sum + file.length, 0)
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(centralSize), ...u32(offset), ...u16(0)])
  return new Blob([...locals, ...centrals, end], { type: 'application/zip' })
}

const renderValue = (value) => {
  if (Array.isArray(value)) {
    return `<ul>${value.map((item) => `<li>${typeof item === 'object' ? esc([item.role, item.name, item.email].filter(Boolean).join(' - ')) : esc(item)}</li>`).join('')}</ul>`
  }
  return `<p>${esc(value)}</p>`
}

export const documentHtml = (doc, data) => {
  const body = doc.type === 'summary'
    ? '<section><h3>Purpose</h3><p>A complete overview of your startup journey.</p><h3>Use</h3><p>Share with mentors, investors, and incubators.</p><h3>Integrity</h3><p>Information represents the current submitted status.</p></section>'
    : doc.type === 'team'
      ? `<table><tr><th>Role</th><th>Name</th><th>Email</th><th>User ID</th></tr>${(data.team || []).map((m) => `<tr><td>${esc(m.role)}</td><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.userId)}</td></tr>`).join('')}</table>`
      : (doc.fields || []).filter((item) => hasValue(data[item.key])).map((item) => `<section><label>${esc(item.label)}</label>${renderValue(data[item.key])}</section>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}body{font-family:Arial,sans-serif;color:#101827}.page{width:210mm;min-height:297mm;box-sizing:border-box;padding:14mm 12mm 10mm;page-break-after:always}.head,.foot{display:flex;justify-content:space-between;color:#335b9a;font-size:7px;letter-spacing:2px;font-weight:bold}.foot{margin-top:12mm}h1{font-size:17px;letter-spacing:6px;text-transform:uppercase;color:#1d2a44;border-bottom:2px solid #6d5cff;padding-bottom:5mm}section{border:1px solid #d7dce5;border-radius:5px;padding:4mm;margin:4mm 0;break-inside:avoid}label{display:block;color:#5b6678;font-size:7px;letter-spacing:1px;text-transform:uppercase;font-weight:bold}p,li,td{font-size:10px;line-height:1.55}table{width:100%;border-collapse:collapse;margin-top:8mm}th{background:#0757bd;color:#fff;text-align:left}td,th{border:1px solid #cfd6e4;padding:4mm}</style></head><body><div class="page"><div class="head"><span>COLLAB PRE-INCUBATION PLATFORM</span><span>STARTUP</span></div><h1>${doc.number}. ${esc(doc.title)}</h1>${body}${doc.declaration && hasValue(data.declarationText) ? `<section><label>Declaration text</label>${renderValue(data.declarationText)}</section>` : ''}<div class="foot"><span>Prepared via Collab Pre-Incubation Pipeline</span><span>CONFIDENTIAL</span></div></div></body></html>`
}

export const buildDocFiles = (data) => packageDocuments.map((doc) => ({
  name: `documents/${String(doc.number).padStart(2, '0')}_${clean(doc.title)}.doc`,
  content: documentHtml(doc, data)
}))

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
