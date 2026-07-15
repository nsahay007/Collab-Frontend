import React from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'

const env = import.meta.env
const socials = [
  ['LinkedIn', env.VITE_LINKEDIN_URL],
  ['Instagram', env.VITE_INSTAGRAM_URL],
  ['X', env.VITE_X_URL],
  ['GitHub', env.VITE_GITHUB_URL]
].filter(([, href]) => Boolean(href))

const groups = [
  ['Platform', [['Discover', '/discover'], ['Build', '/build'], ['Builder’s League', '/opportunities'], ['Opportunities', '/opportunities'], ['Workspace', '/build']]],
  ['Company', [['About', '/about'], ['Contact Us', '/contact'], ['FAQs', '/faq'], ['Blog', null]]],
  ['Legal', [['Terms & Conditions', '/legal/terms-of-service'], ['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookies'], ['Community Guidelines', '/community-guidelines'], ['Disclaimer', '/disclaimer']]],
  ['Resources', [['Help Center', '/help'], ['Support', '/support'], ['Report a Bug', '/report-bug'], ['Feedback', '/feedback'], ['Status', null]]]
]

export default function Footer() {
  return (
    <footer className="collab-footer mt-14 border-t border-border bg-bg-main/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <BrandLogo size="sm" />
          <p className="mt-4 text-sm text-text-secondary">Building the next generation of founders and startups.</p>
          {socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="footer-link">{label}</a>)}
            </div>
          )}
        </div>
        {groups.map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
            <div className="mt-3 space-y-2">
              {links.map(([label, href]) => href
                ? <Link key={label} to={href} className="footer-link">{label}</Link>
                : <span key={label} className="block text-sm text-text-muted">{label} (Coming Soon)</span>)}
            </div>
          </nav>
        ))}
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-text-muted">
        © 2026 Collab. All rights reserved. Built for the next generation of founders.
      </div>
    </footer>
  )
}
