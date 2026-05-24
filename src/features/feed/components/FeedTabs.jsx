import React from 'react'
import { motion } from 'framer-motion'
import { FEED_TABS } from '../feedUtils'
import { springSnappy } from '../../../utils/motion'

export default function FeedTabs({ activeTab, onChange }) {
  return (
    <div className="feed-tabs" role="tablist" aria-label="Feed filters">
      {FEED_TABS.map((tab) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`feed-tab relative ${active ? 'text-text-primary' : 'text-text-muted'}`}
          >
            {active && (
              <motion.span
                layoutId="feed-tab-pill"
                className="absolute inset-0 rounded-lg bg-bg-elevated border border-border"
                transition={springSnappy}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
