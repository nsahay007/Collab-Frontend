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

const paginateItems = (items) => {
  const pages = [[]]
  let used = 0
  items.forEach((item) => {
    const text = item.html.replace(/<[^>]+>/g, ' ')
    const cost = 300 + text.length
    if (used + cost > 2500 && pages[pages.length - 1].length) {
      pages.push([])
      used = 0
    }
    pages[pages.length - 1].push(item.html)
    used += cost
  })
  return pages
}

const fieldItems = (doc, data) => (doc.fields || []).flatMap((item) => {
  const value = data[item.key]
  if (!hasValue(value)) return []
  if (typeof value === 'string' && value.length > 1200) {
    return splitText(value).map((part, index) => ({
      html: `<section><label>${esc(item.label)}${index ? ' continued' : ''}</label>${renderValue(part)}</section>`
    }))
  }
  return [{ html: `<section><label>${esc(item.label)}</label>${renderValue(value)}</section>` }]
})

const teamItems = (data) => [{
  html: `<table><tr><th>Role</th><th>Name</th><th>Email</th><th>User ID</th></tr>${(data.team || []).map((m) => `<tr><td>${esc(m.role)}</td><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.userId)}</td></tr>`).join('')}</table>`
}]

const summaryItems = () => [{
  html: '<section class="summary"><h3>Purpose</h3><p>A complete overview of your startup journey.</p><h3>Use</h3><p>Share with mentors, investors, and incubators.</p><h3>Integrity</h3><p>Information represents the current submitted status.</p></section>'
}]

export const documentHtml = (doc, data) => {
  const baseItems = doc.type === 'summary' ? summaryItems() : doc.type === 'team' ? teamItems(data) : fieldItems(doc, data)
  const declaration = doc.declaration && hasValue(data.declarationText)
    ? [{ html: `<section><label>Declaration text</label>${renderValue(data.declarationText)}</section>` }]
    : []
  const pages = paginateItems([...baseItems, ...declaration])
  const pageHtml = pages.map((items, index) => `${index ? '<br clear=all style=\"page-break-before:always;mso-special-character:line-break\" />' : ''}<div class="page"><table class="head"><tr><td>COLLAB PRE-INCUBATION PLATFORM</td><td class="right">${esc(data.startupName || 'STARTUP')}</td></tr></table><h1>${doc.number}. ${esc(doc.title)}${index ? ` / PAGE ${index + 1}` : ''}</h1><main>${items.join('')}</main><table class="foot"><tr><td>Prepared via Collab Pre-Incubation Pipeline</td><td class="right">PAGE ${index + 1} - CONFIDENTIAL</td></tr></table></div>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff;color:#101827;font-family:Arial,sans-serif}.page{width:210mm;height:297mm;box-sizing:border-box;padding:12mm 11mm 7mm;page-break-after:always;mso-page-break-after:always;break-after:page;position:relative;background:#fff;overflow:hidden}.head,.foot{width:100%;border-collapse:collapse;color:#335b9a;font-size:7px;letter-spacing:2px;font-weight:bold;text-transform:uppercase}.head td,.foot td{border:0;padding:0}.right{text-align:right}.foot{margin-top:8mm;color:#46556b;font-size:6px}h1{font-size:17px;letter-spacing:6px;text-transform:uppercase;color:#1d2a44;border-bottom:2px solid #6d5cff;padding-bottom:5mm;margin:10mm 0 5mm}main{min-height:232mm;padding-bottom:4mm}section{border:1px solid #d7dce5;border-radius:5px;padding:3.5mm;margin:3.5mm 0;page-break-inside:avoid}label{display:block;color:#5b6678;font-size:7px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;margin-bottom:2mm}p,li,td{font-size:10.5px;line-height:1.55}ul{margin:2mm 0 0 5mm;padding:0}table{width:100%;border-collapse:collapse;margin-top:8mm;font-size:9.5px}th{background:#0757bd;color:#fff;text-align:left}td,th{border:1px solid #cfd6e4;padding:4mm;vertical-align:middle}.summary{background:#f7f8ff;border:0;padding:10mm 18mm}.summary h3{font-size:14px;margin:0 0 2mm}.page:last-child{page-break-after:auto;mso-page-break-after:auto}</style></head><body>${pageHtml}</body></html>`
}

export const buildDocFiles = (data) => packageDocuments.map((doc) => ({
  name: `documents/${String(doc.number).padStart(2, '0')}_${clean(doc.title)}.doc`,
  content: documentHtml(doc, data)
}))

const pdfText = (text) => String(text ?? '').replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7E]/g, '')
const wrap = (text, maxChars) => {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxChars && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  })
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

const pdfObjects = (streams) => {
  const objects = []
  const add = (body) => {
    objects.push(body)
    return objects.length
  }
  const font = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const pages = []
  streams.forEach((stream) => {
    const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
    pages.push(add(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`))
  })
  const pagesId = add(`<< /Type /Pages /Kids [${pages.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`)
  pages.forEach((id) => { objects[id - 1] = objects[id - 1].replace('/Parent 0 0 R', `/Parent ${pagesId} 0 R`) })
  const catalog = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((body, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`
  return encoder.encode(pdf)
}

export const buildPdfFiles = (data) => packageDocuments.map((doc) => {
  const streams = []
  let ops = ''
  let y = 0
  const text = (value, x, yy, size = 10) => { ops += `BT /F1 ${size} Tf ${x} ${yy} Td (${pdfText(value)}) Tj ET\n` }
  const rect = (x, yy, w, h) => { ops += `0.84 0.87 0.92 RG ${x} ${yy} ${w} ${h} re S\n` }
  const header = (page) => {
    ops = ''
    text('COLLAB PRE-INCUBATION PLATFORM', 36, 805, 7)
    text(pdfText(data.startupName || 'STARTUP').slice(0, 28), 470, 805, 7)
    text(`${doc.number}. ${doc.title}${page > 1 ? ` / PAGE ${page}` : ''}`, 36, 760, 17)
    ops += '0.05 0.34 0.75 RG 36 740 m 559 740 l S\n'
    y = 710
  }
  const footer = (page) => {
    text('Prepared via Collab Pre-Incubation Pipeline', 36, 28, 7)
    text(`PAGE ${page} - CONFIDENTIAL`, 470, 28, 7)
    streams.push(ops)
  }
  const newPage = () => {
    if (ops) footer(streams.length + 1)
    header(streams.length + 1)
  }
  const drawSection = (label, value) => {
    const lines = Array.isArray(value)
      ? value.map((item) => typeof item === 'object' ? [item.role, item.name, item.email].filter(Boolean).join(' - ') : String(item))
      : wrap(value, 92)
    const h = Math.max(48, 28 + lines.length * 13)
    if (y - h < 55) newPage()
    rect(36, y - h, 523, h)
    text(label.toUpperCase(), 48, y - 18, 7)
    lines.forEach((line, index) => text(line, 48, y - 36 - index * 13, 10))
    y -= h + 14
  }
  header(1)
  const items = doc.type === 'summary'
    ? [{ label: 'Purpose', value: 'A complete overview of your startup journey.' }, { label: 'Use', value: 'Share with mentors, investors, and incubators.' }, { label: 'Integrity', value: 'Information represents the current submitted status.' }]
    : doc.type === 'team'
      ? [{ label: 'Team roster', value: data.team || [] }]
      : (doc.fields || []).filter((item) => hasValue(data[item.key])).map((item) => ({ label: item.label, value: data[item.key] }))
  items.forEach((item) => drawSection(item.label, item.value))
  if (doc.declaration && hasValue(data.declarationText)) drawSection('Declaration text', data.declarationText)
  footer(streams.length + 1)
  return {
    name: `documents/${String(doc.number).padStart(2, '0')}_${clean(doc.title)}.pdf`,
    content: pdfObjects(streams)
  }
})

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
