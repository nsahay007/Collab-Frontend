import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../../../components/common/Badge'
export default function BuilderProfileModal({ builderOverride, open, onClose }) {
  const builder = builderOverride

  return (
    <AnimatePresence>
      {open && builder && (
        <>
          <motion.button
            type="button"
            aria-label="Close profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-labelledby="builder-profile-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-[90] w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-bg-elevated shadow-elevated p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="feed-avatar feed-avatar-lg shrink-0">{builder.name.charAt(0)}</div>
              <div className="min-w-0">
                <h2 id="builder-profile-title" className="text-lg font-semibold text-text-primary">
                  {builder.name}
                </h2>
                <p className="text-sm text-text-secondary mt-0.5">{builder.role}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Startup</p>
                <p className="text-text-primary font-medium">{builder.venture}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(builder.skills || []).map((skill) => (
                    <Badge key={skill} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
              {builder.email && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Contact</p>
                  <a href={`mailto:${builder.email}`} className="text-primary hover:text-primary-hover">
                    {builder.email}
                  </a>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {builder.github && (
                  <a href={builder.github} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">
                    GitHub
                  </a>
                )}
                {builder.linkedin && (
                  <a href={builder.linkedin} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            <p className="mt-5 text-xs text-text-muted border-t border-border pt-4">
              Builder identity card — execution profile only. No social activity feed.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors duration-150"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
