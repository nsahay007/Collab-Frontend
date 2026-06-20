import React, { useState } from 'react'
import Badge from '../../../components/common/Badge'
import { formatFeedTime, getTypeBadgeVariant, getTypeLabel } from '../feedUtils'
import { resolvePostAuthor } from '../feedAuthor'
import FeedComments from './FeedComments'

export default function FeedPostCard({
  post,
  currentUserId,
  currentUserName,
  onVote,
  onAddComment,
  onDelete,
  onOpenProfile,
}) {
  const [showComments, setShowComments] = useState(false)

  const author = resolvePostAuthor(post, currentUserId, currentUserName)
  const canDelete = post.authorId === currentUserId || post.author?.id === currentUserId

  const userVote = post.likedBy?.includes(currentUserId)
    ? 'like'
    : post.dislikedBy?.includes(currentUserId)
      ? 'dislike'
      : null

  return (
    <article className="feed-post">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onOpenProfile}
          className="feed-avatar shrink-0 hover:ring-2 hover:ring-primary/30 transition-shadow duration-150"
          aria-label={`View ${author.name}'s builder profile`}
        >
          {author.name.charAt(0)}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              type="button"
              onClick={onOpenProfile}
              className="font-semibold text-[15px] text-text-primary hover:underline text-left"
            >
              {author.name}
            </button>
            {author.venture && (
              <>
                <span className="text-text-muted text-sm">·</span>
                <span className="text-sm text-text-muted truncate">{author.venture}</span>
              </>
            )}
            <span className="text-text-muted text-sm">·</span>
            <time className="text-sm text-text-muted">{formatFeedTime(post.createdAt)}</time>
            <Badge variant={getTypeBadgeVariant(post.type)} className="ml-auto sm:ml-1">
              {getTypeLabel(post.type)}
            </Badge>
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this feed post?')) onDelete?.(post.id)
                }}
                className="text-xs text-error hover:underline"
              >
                Delete
              </button>
            )}
          </div>

          <p className="mt-2 text-[15px] text-text-primary leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {post.media && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border">
              <img src={post.media} alt="Post attachment" className="w-full max-h-80 object-cover" />
            </div>
          )}

          <div className="feed-actions mt-3">
            <button
              type="button"
              onClick={() => onVote(post.id, 'like')}
              className={`feed-action ${userVote === 'like' ? 'feed-action--active-like' : ''}`}
              aria-pressed={userVote === 'like'}
              aria-label="Helpful"
            >
              <svg className="feed-thumb-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M2.75 10.25h3.5v10h-3.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm5.5 9.83V10.1l4.22-7.03c.33-.55.94-.88 1.58-.84l.48.03c1.2.08 2.02 1.25 1.68 2.4l-1.1 3.59h4.15a3 3 0 0 1 2.9 3.76l-1.36 5.2a4 4 0 0 1-3.87 2.99h-6.26c-.84 0-1.67-.04-2.42-.12Z" />
              </svg>
              <span>{post.likes || 0}</span>
            </button>
            <button
              type="button"
              onClick={() => onVote(post.id, 'dislike')}
              className={`feed-action ${userVote === 'dislike' ? 'feed-action--active-dislike' : ''}`}
              aria-pressed={userVote === 'dislike'}
              aria-label="Not helpful"
            >
              <svg className="feed-thumb-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M21.25 13.75h-3.5v-10h3.5a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1Zm-5.5-9.83v9.98l-4.22 7.03c-.33.55-.94.88-1.58.84l-.48-.03c-1.2-.08-2.02-1.25-1.68-2.4l1.1-3.59H4.74a3 3 0 0 1-2.9-3.76l1.36-5.2A4 4 0 0 1 7.07 3.8h6.26c.84 0 1.67.04 2.42.12Z" />
              </svg>
              <span>{post.dislikes || 0}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowComments((p) => !p)}
              className={`feed-action ${showComments ? 'feed-action--active-comment' : ''}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>

          {showComments && (
            <FeedComments
              comments={post.comments}
              postType={post.type}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onAddComment={(content) => onAddComment(post.id, content)}
            />
          )}
        </div>
      </div>
    </article>
  )
}
