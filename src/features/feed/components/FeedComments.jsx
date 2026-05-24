import React, { useState } from 'react'
import Button from '../../../components/common/Button'
import { formatFeedTime } from '../feedUtils'
import { SEED_BUILDERS } from '../feedSeed'

export default function FeedComments({
  comments = [],
  postType,
  currentUserId,
  currentUserName,
  onAddComment,
}) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const placeholder =
    postType === 'blocker'
      ? 'Share a solution, resource, or technical guidance…'
      : 'Add constructive feedback or encouragement…'

  const handleSubmit = async (e) => {
    e.preventDefault()
    const value = text.trim()
    if (!value || submitting) return
    setSubmitting(true)
    try {
      await onAddComment(value)
      setText('')
    } finally {
      setSubmitting(false)
    }
  }

  const resolveAuthor = (authorId) => {
    if (authorId === currentUserId) {
      return { name: currentUserName || 'You', id: authorId }
    }
    const seed = SEED_BUILDERS[authorId]
    return seed ? { name: seed.name, id: authorId } : { name: 'Builder', id: authorId }
  }

  return (
    <div className="feed-comments border-t border-border pt-3 mt-3">
      {comments.length > 0 && (
        <ul className="space-y-3 mb-3">
          {comments.map((comment) => {
            const author = resolveAuthor(comment.authorId)
            return (
              <li key={comment.id} className="flex gap-2">
                <div className="feed-avatar feed-avatar-sm shrink-0">{author.name.charAt(0)}</div>
                <div className="min-w-0 flex-1 rounded-xl bg-bg-secondary/60 px-3 py-2">
                  <p className="text-xs font-medium text-text-primary">{author.name}</p>
                  <p className="text-sm text-text-secondary mt-0.5">{comment.content}</p>
                  <p className="text-[11px] text-text-muted mt-1">{formatFeedTime(comment.createdAt)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!text.trim() || submitting}>
          Reply
        </Button>
      </form>
    </div>
  )
}
