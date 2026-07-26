import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'https://www.joincollab.org'
const DEFAULT_TITLE = 'COLLAB | India\'s Pre-Incubation Startup Ecosystem'
const DEFAULT_DESC = 'COLLAB helps student founders build teams, discover builder events, create ventures, and become incubation-ready.'

const legalTitles = {
  'terms-of-service': ['Terms of Service | COLLAB', 'Rules and conditions for using COLLAB.'],
  'privacy-policy': ['Privacy Policy | COLLAB', 'How COLLAB collects, uses, and protects founder and venture data.'],
  'ip-ownership-policy': ['IP & Ownership Policy | COLLAB', 'Founders and teams keep ownership of startup concepts and venture content.'],
  'security-policy': ['Security Policy | COLLAB', 'How COLLAB protects accounts, files, and startup workspaces.'],
  'ecosystem-guidelines': ['Ecosystem Guidelines | COLLAB', 'Professional standards for startup collaboration on COLLAB.'],
  'community-guidelines': ['Ecosystem Guidelines | COLLAB', 'Professional standards for startup collaboration on COLLAB.'],
  'dispute-resolution': ['Dispute Resolution | COLLAB', 'How COLLAB handles ownership, collaboration, and platform disputes.']
}

const staticTitles = {
  '/about': ['About COLLAB | Startup Ecosystem for Student Founders', 'Learn why COLLAB exists and how it helps student founders become incubation-ready.'],
  '/contact': ['Contact COLLAB | Support and Partnerships', 'Contact COLLAB for support, business enquiries, sponsorships, and partnerships.'],
  '/faq': ['COLLAB FAQ | Founder and Startup Platform Questions', 'Answers to common questions about COLLAB, Builder’s League, startup ownership, teams, and support.'],
  '/help': ['COLLAB Help Center', 'Get help with COLLAB accounts, startup workspaces, teams, and project workflows.'],
  '/support': ['COLLAB Support', 'Get support for account, workspace, notification, or project issues.'],
  '/report-bug': ['Report a Bug | COLLAB', 'Report bugs and technical issues to the COLLAB team.'],
  '/feedback': ['Feedback | COLLAB', 'Share product feedback to improve the COLLAB startup ecosystem.'],
  '/privacy': ['Privacy Policy | COLLAB', 'How COLLAB handles user, team, and venture information.'],
  '/cookies': ['Cookie Policy | COLLAB', 'How COLLAB uses cookies and browser storage for essential platform functionality.'],
  '/community-guidelines': ['Community Guidelines | COLLAB', 'Standards for a safe, serious, founder-friendly startup ecosystem.'],
  '/disclaimer': ['Disclaimer | COLLAB', 'Important limits about COLLAB platform support and startup outcomes.']
}

function setMeta(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

function setJsonLd(items) {
  document.querySelectorAll('script[data-collab-seo]').forEach((node) => node.remove())
  items.forEach((item) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.collabSeo = 'true'
    script.textContent = JSON.stringify(item)
    document.head.appendChild(script)
  })
}

function routeSeo(pathname) {
  if (pathname === '/') return [DEFAULT_TITLE, DEFAULT_DESC, true]
  if (pathname === '/security') return ['Security & Trust | COLLAB', 'How COLLAB protects founder ownership, workspaces, files, and accounts.', true]
  if (staticTitles[pathname]) return [...staticTitles[pathname], true]
  if (pathname === '/legal') return ['Legal & Policies | COLLAB', 'COLLAB legal, privacy, security, ownership, and ecosystem policies.', true]
  if (pathname.startsWith('/legal/')) return [...(legalTitles[pathname.split('/').pop()] || ['COLLAB Policy', DEFAULT_DESC]), true]
  return ['COLLAB', DEFAULT_DESC, false]
}

export default function SEO() {
  const { pathname } = useLocation()

  useEffect(() => {
    const [title, description, indexable] = routeSeo(pathname)
    const canonical = `${SITE}${pathname === '/' ? '/' : pathname}`
    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', indexable ? 'index,follow' : 'noindex,nofollow')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', pathname === '/' ? 'website' : 'article')
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:site_name', 'COLLAB')
    setMeta('property', 'og:image', `${SITE}/favicon-512.png`)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    if (indexable) setCanonical(canonical)
    else document.head.querySelector('link[rel="canonical"]')?.remove()
    setJsonLd(indexable ? [
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'COLLAB', url: SITE, email: 'support@joincollab.org' },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'COLLAB', url: SITE },
      pathname === '/' ? { '@context': 'https://schema.org', '@type': 'Event', name: 'Builder\'s League', eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled', organizer: { '@type': 'Organization', name: 'COLLAB', url: SITE } } : null
    ].filter(Boolean) : [])
  }, [pathname])

  return null
}
